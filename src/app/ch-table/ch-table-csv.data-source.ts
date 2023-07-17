import { HttpClient } from '@angular/common/http';
import { filter, Observable, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { v4 } from 'uuid';
import {
  ChTableDataSourceStore, DATA_TYPES_REGEXES, DATA_TYPES_WIDTHS, DataTypes,
  GenChTableDataSource,
  IChDataColumn,
  IChDataRow,
  IChDataSourceState
} from './ch-table.data-source';
import { parse } from 'papaparse'
const STRING_CASE_FUNCTIONS: { [key: string ]: (v: string) => string } = {
  lower: (value: string) => value?.toLowerCase(),
  upper: (value: string) => value?.toUpperCase()
};

export type Delimiter = '\t' | ',' | ';';

const DELIMITER_VALIDATIONS = {
  '\t': /^([^\t]*\t)*[^\t]*$/,
  ';': /^([^;]*;)*[^;]*$/,
  ',': /^([^,]*,)*[^,]*$/,
}

interface ColumnTypeCounts {
  [key: string]: Partial<{ [key in DataTypes]: number }>
}

export interface ChLocalPaginationState<TData extends IChDataRow> extends IChDataSourceState<TData> {
  data: TData[];
  page: number;
  limit: number;
  lastChunkSize: number;
  source: File | string | null;
  busy: boolean;
  delimiter: Delimiter;
}

export class ChURLTableDataSourceStore<TData extends IChDataRow> extends ChTableDataSourceStore<ChLocalPaginationState<TData>, TData> {
  readonly data$ = this.select(({ data }) => data);
  readonly page$ = this.select(({ page }) => page);
  readonly limit$ = this.select(({ limit }) => limit);
  readonly source$ = this.select(({ source }) => source);
  readonly lastChunkSize$ = this.select(({ lastChunkSize }) => lastChunkSize);
  readonly delimiter$ = this.select(({ delimiter }) => delimiter);

  constructor(readonly _httpClient: HttpClient) {
    super({
      source: null,
      data: [],
      visibleData: [],
      columns: [],
      isLoading: false,
      limit: 100,
      page: 1,
      lastChunkSize: 0,
      busy: false,
      delimiter: ','
    });
  }

  readonly load = this.effect(
    (event$: Observable<void>) => event$
      .pipe(
        withLatestFrom(this.source$),
        switchMap(([, source]) => {
          if (!source) {
            return of(null);
          }

          if (source instanceof File) {
            return new Observable<string>((observer) => {
              const reader = new FileReader();
              reader.onload = () => {
                observer.next(reader.result as string);
                observer.complete();
              };
              reader.onerror = () => {
                observer.error(reader.error);
              };
              reader.readAsText(source);
            });
          }

          return this._httpClient.get(source, { responseType: 'text' });
        }),
        withLatestFrom(this.page$, this.limit$, this.delimiter$),
        tap(([result, page, limit, delimiter]) => {
          if (!result) {
            return;
          }

          console.log({
            result,
            delimiter
          })

          const beginTime = new Date().getTime();
          const data = parse<any>(result, {
            delimiter
          });
          console.log(data);
          const lines = result.split('\r\n');
          console.log({
            lines: lines.filter((_, i) => i < 200)
          });
          let columns: IChDataColumn[]  | null = null;
          let body: TData[] = [];
          const columnTypeCounts: ColumnTypeCounts = { };
          const dataTypes = Object.values(DataTypes)

          for(let index = 0; index < lines.length; index++) {
            const line = lines[index];


            if (!this.isCSV(line, delimiter)){
              columns && body.push(
                Object.fromEntries(
                  columns
                    .map((key) => [key, ''])
                    .concat([
                      ['CH_ROW_ID', v4()],
                      ['CH_ROW_ERROR', 'It is not a csv line']
                    ])
                )
              )
              continue;
            }

            const values = line.split(new RegExp(delimiter, 'g'));

            if (!columns) {
              columns = values.map((label) => ({
                label,
                key: label.toLowerCase(),
                type: DataTypes.unknown,
                width: DATA_TYPES_WIDTHS[DataTypes.unknown],
              }));
              continue;
            }

            const row: any  = { CH_ROW_ID: v4() };
            for (let colIndex = 0; colIndex < values.length; colIndex++) {
              const column = columns[colIndex];

              if (!column) {
                continue;
              }

              const value = values[colIndex];
              row[column.key] = value;

              const type = dataTypes
                .find((dataType) => DATA_TYPES_REGEXES[dataType]
                  .some((pattern) => value.match(pattern))) ?? DataTypes.unknown;

              const columnCounts = columnTypeCounts[column.key];
              if (columnCounts && !value) {
                columnCounts[type] = (columnCounts[type] ?? 0) + 1;
              } else {
                columnTypeCounts[column.key] = { [type]: DataTypes.unknown };
              }
            }

            body.push(row);
          }

          if (!columns) {
            return;
          }

          const chunk = this.paginate(body, limit, page);
          const finishTime = new Date().getTime();
          const columnTypes = Object.fromEntries(Object
            .entries(columnTypeCounts)
            .map(([column, typeCounts]) => [
              column,
              Object
                .entries(typeCounts)
                .sort(([, a], [, b]) => b - a)[0][0] ?? DataTypes.unknown
            ]));

          this.patchSate({
            data: body,
            visibleData: chunk,
            lastChunkSize: chunk.length,
            columns: columns.map((column) => ({
              ...column,
              type: columnTypes[column.key] as DataTypes,
              width: DATA_TYPES_WIDTHS[columnTypes[column.key] as DataTypes],
            })),
          });

          console.log({
            beginTime,
            finishTime,
            elapsedTime: finishTime - beginTime
          });
        })
      )
  );

  readonly loadMore = this.effect((event$: Observable<void>) => event$.pipe(
    withLatestFrom(
      this.visibleData$,
      this.data$,
      this.page$,
      this.limit$,
      this.lastChunkSize$,
    ),
    filter(([,,,, limit, lastChunkSize]) => lastChunkSize === limit),
    tap({
      next: ([,visibleData, data, page, limit]) => {
        const chunk = this.paginate(data, limit, page + 1);
        this.patchSate({
          visibleData: visibleData.concat(chunk),
          page: page + 1,
          lastChunkSize: chunk.length
        })
      }
    })
  ));

  readonly setSource = this.effect(
    (event$: Observable<File | string>) => event$.pipe(
      tap((source) => this.patchSate({ source })),
      tap(() => this.load())
    )
  );

  readonly changeCase = this.updater((state, stringCase: 'lower' | 'upper', columnKey: string, index?: number) => {
    const data = state.data as any[];
    const caseFunction = STRING_CASE_FUNCTIONS[stringCase];

    if (typeof index === 'number') {
      data[index][columnKey] = caseFunction(data[index][columnKey]);
    } else {
      data.forEach((item) => {
        item[columnKey] = caseFunction(item[columnKey]);
      });
    }

    const visibleData = this.paginate(data, state.visibleData.length, 1);

    return {
      ...state,
      data,
      visibleData,
    }
  })


  readonly setDelimiter = this.updater((state, delimiter: Delimiter) => ({ ...state, delimiter }));

  paginate(array: Array<TData>, pageSize: number, pageNumber: number) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  isCSV(value: string, delimiter: Delimiter) {
    const pattern = DELIMITER_VALIDATIONS[delimiter];
    return pattern.test(value);
  }
}

export class ChURLTableDataSource<TData extends IChDataRow = IChDataRow>
  extends GenChTableDataSource<ChURLTableDataSourceStore<TData>, ChLocalPaginationState<TData>, TData> {

  constructor(httpClient: HttpClient) {
    super(new ChURLTableDataSourceStore(httpClient));
  }

  setSource(source: File | string): void {
    this._store.setSource(source);
  }

  changeCase(stringCase: 'lower' | 'upper', columnKey: string, index?: number) {
    this._store.changeCase(stringCase, columnKey, index);
  }

  setDelimiter(value: Delimiter) {
    this._store.setDelimiter(value);
  }
}
