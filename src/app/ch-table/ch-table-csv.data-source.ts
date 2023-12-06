import { HttpClient } from '@angular/common/http';
import { filter, Observable, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { v4 } from 'uuid';
import {
  ChTableDataSourceStore,
  DATA_TYPES_REGEXES,
  DATA_TYPES_WIDTHS,
  DataTypes,
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

function loadFile<TData>(source: File | string): Observable<{ body: TData[], columnTypes: { [key: string]: string }, columns: IChDataColumn[] }> {
  return new Observable((subscriber) => {
    const dataTypes = Object.values(DataTypes)
    const columnTypeCounts: ColumnTypeCounts = { };

    let columns: IChDataColumn[]  | null = null;
    let body: TData[] = [];
    const beginTime = new Date().getTime();

    parse<string[]>(source, {
      worker: true,
      step: (step) => {
        const values = step.data;
        if (!columns) {
          columns = values.map((label) => ({
            label,
            key: label.toLowerCase(),
            type: DataTypes.unknown,
            width: DATA_TYPES_WIDTHS[DataTypes.unknown],
          }));
          return;
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
              .some((pattern) => value && value.match(pattern))) ?? DataTypes.unknown;

          const columnCounts = columnTypeCounts[column.key];
          if (columnCounts && !value) {
            columnCounts[type] = (columnCounts[type] ?? 0) + 1;
          } else {
            columnTypeCounts[column.key] = { [type]: 1 };
          }
        }

        body.push(row);
      },
      complete: () => {
        if (!columns) {
          subscriber.complete();
          return;
        }

        const columnTypes = Object.fromEntries(Object
          .entries(columnTypeCounts)
          .map(([column, typeCounts]) => [
            column,
            Object
              .entries(typeCounts)
              .sort(([, a], [, b]) => b - a)[0][0] ?? DataTypes.unknown
          ]));


        subscriber.next({
          body,
          columnTypes,
          columns,
        });

        const finishTime = new Date().getTime();
        console.log('METRICS -> ', {
          beginTime,
          finishTime,
          elapsedTime: finishTime - beginTime,
          lines: body.length,
          columns: columns.length,
        });
        subscriber.complete();
      },
      error: (error) => {
        subscriber.error(error);
        subscriber.complete();
      }
    })
  });
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
            return loadFile<TData>(source);
          }

          return this._httpClient.get(source, { responseType: 'text' }).pipe(switchMap((content) => loadFile<TData>(content)));
        }),
        withLatestFrom(this.limit$, this.delimiter$),
        tap(([csv, limit, delimiter]) => {
          if (!csv) {
            return;
          }
          const page = 1;
          const chunk = this.paginate(csv.body, limit, 1);

          this.patchSate({
            data: csv.body,
            visibleData: chunk,
            lastChunkSize: chunk.length,
            columns: csv.columns.map((column) => ({
              ...column,
              type: csv.columnTypes[column.key] as DataTypes,
              width: DATA_TYPES_WIDTHS[csv.columnTypes[column.key] as DataTypes],
            })),
            page,
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
      tap((event$) => console.log('DATA SOURCE -> ', event$)),
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

  setValue = this.updater(( state, value: string, columnKey: string, rowIndex: number) => {
    const data = state.data as any[];
    data[rowIndex][columnKey] = value;

    const visibleData = state.visibleData as any[];
    visibleData[rowIndex][columnKey] = value;

    return {
      ...state,
      data,
      visibleData,
    };
  });
}

export class ChURLTableDataSource<TData extends IChDataRow = IChDataRow>
  extends GenChTableDataSource<ChURLTableDataSourceStore<TData>, ChLocalPaginationState<TData>, TData> {

  constructor(httpClient: HttpClient) {
    super(new ChURLTableDataSourceStore(httpClient));
  }

  setSource(source: File | string): void {
    this._store.setSource(source);
  }

  loadMore(): void {
    this._store.loadMore();
  }

  changeCase(stringCase: 'lower' | 'upper', columnKey: string, index?: number) {
    this._store.changeCase(stringCase, columnKey, index);
  }

  setDelimiter(value: Delimiter) {
    this._store.setDelimiter(value);
  }

  updateValue(value: string, columnKey: string, rowIndex: number) {
      this._store.setValue(value, columnKey, rowIndex);
  }
}
