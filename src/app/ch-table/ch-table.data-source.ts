import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { filter, Observable, of, switchMap, tap, withLatestFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Store } from "./store";
import { v4 } from 'uuid';

export interface DataSourceState<TSource> {
  visibleData: any[];
  isLoading: boolean;
  source: TSource | null;
  columns: { [key: string]: string };
  errors: { line: number; value: string; error: string; }[] | null
}

export abstract class ChTableDataSourceStore<TState extends DataSourceState<TSource>, TSource> extends Store<TState> {
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly source$ = this.select(({ source }) => source);
  readonly errors$ = this.select(({ errors }) => errors)
  readonly visibleData$ = this.select(({ visibleData }) => visibleData);
  readonly columns$ = this.select(({ columns }) => Object.entries(columns).map(([key, label]) => ({ key, label })));
  readonly columnsNames$ = this.select(({ columns }) => Object.keys(columns));


  protected constructor(initialState: TState) {
    super(initialState);
  }

  readonly abstract loadDataFromSource: (source: TSource) => void;
  readonly abstract loadMore: () => void;

  readonly setSource = this.effect((event$: Observable<TSource>) =>
    event$.pipe(
      tap((source) => this.patchSate({ source } as Partial<TState>)),
      tap((source) => this.loadDataFromSource(source))
    ),
  );

  readonly setData = this.updater((state, data: any[]) => ({
    ...state,
    data,
  }));

  readonly setVisibleData = this.updater((state, visibleData: any[]) => ({
    ...state,
    visibleData,
  }));
}


export abstract class ChTableDataSource<TSource> extends DataSource<any> {
  abstract readonly columns$: Observable<{ key: string, label: string }[]>;
  abstract readonly columnNames$: Observable<string[]>;

  abstract loadMore(): void;
  abstract setSource(source: TSource): void;
}

export abstract class GenChTableDataSource<
  TDataSource extends ChTableDataSourceStore<TState, TSource>,
  TState extends DataSourceState<TSource>,
  TSource
> extends ChTableDataSource<TSource> {

  readonly columns$ = this._store.columns$;
  readonly columnNames$ = this._store.columnsNames$;

  protected constructor(protected readonly _store: TDataSource) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this._store.visibleData$;
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  setSource(source: TSource): void {
    this._store.setSource(source);
  }
}

export interface ChLocalPaginationState extends DataSourceState<string> {
  data: any[];
  page: number;
  limit: number;
  lastChunkSize: number;
}

export class ChURLTableDataSourceStore extends ChTableDataSourceStore<ChLocalPaginationState, string> {

  readonly data$ = this.select(({ data }) => data);
  readonly page$ = this.select(({ page }) => page);
  readonly limit$ = this.select(({ limit }) => limit);
  readonly lastChunkSize$ = this.select(({ lastChunkSize }) => lastChunkSize);

  constructor(readonly _httpClient: HttpClient) {
    super({
      data: [],
      visibleData: [],
      isLoading: false,
      source: null,
      columns: {},
      errors: null,
      limit: 100000,
      page: 1,
      lastChunkSize: 0,
    });
  }

  readonly loadDataFromSource: (source: string) => void = this.effect(
    (event$) => event$
      .pipe(
        switchMap((url) => {
          if (!url) {
            return of(null);
          }
          return  this._httpClient.get(url, { responseType: 'text' });
        }),
        withLatestFrom(this.page$, this.limit$),
        tap(([result, page, limit]) => {
          if (!result) {
            return;
          }

          const lines = result.split('\n');
          const errors: { line: number, value: string; error: string; }[] = [];
          let headers: string[] | null = null;
          let keys: string[] | null = null;
          let body: { [key: string]: string }[] = [];

          for(let i = 0; i < lines.length; i++) {
            const line = lines[i];

            const extraCols = []
            if (!isCSV(line)){
              errors.push({
                line: i + 1,
                value: line,
                error: 'It is not a csv line'
              });

              keys && body.push(
                Object.fromEntries(
                  keys.map((key) => [key, ''])
                    .concat([
                      ['CH_ROW_ID', v4()],
                      ['CH_ROW_ERROR', 'It is not a csv line']
                    ])
                )
              )
              continue;
            }

            const values = line.split(',');

            if (!headers || !keys) {
              headers = values;
              keys = headers.map((header) => header.toLowerCase());
              continue;
            }

            body.push(
              Object.fromEntries(
                keys
                  .map((key, index) => [key, values[index]])
                  .concat([
                    ['CH_ROW_ID', v4()],
                  ])
              )
            );
          }

          if (!headers) {
            return;
          }

          const chunk = this.paginate(body, limit, page);

          this.patchSate({
            data: body,
            visibleData: chunk,
            lastChunkSize: chunk.length,
            columns: Object.fromEntries(headers.map((header) => [header.toLowerCase(), header])),
            errors,
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
    tap((values) => console.log(values)),
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
  ))

  paginate(array: { [key: string]: string }[], pageSize: number, pageNumber: number) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

}

function isCSV(value: string) {
  const pattern = /^([^,\n]+)(,[^,\n]+)*(\n([^,\n]+)(,[^,\n]+)*)*$/;
  return pattern.test(value);
}
export class ChURLTableDataSource extends GenChTableDataSource<ChURLTableDataSourceStore, ChLocalPaginationState, string> {
  constructor(httpClient: HttpClient) {
    super(new ChURLTableDataSourceStore(httpClient));
  }

  loadMore(): void {
    this._store.loadMore();
  }
}
