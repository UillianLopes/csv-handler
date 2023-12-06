import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable } from "rxjs";
import { Store } from "../core/utils/store";

export enum DataTypes {
  dateTime = 'dateTime',
  date = 'date',
  email = 'email',
  integer = 'integer',
  float = 'float',
  text = 'text',
  unknown = 'unknown',
}

export const DATA_TYPES_REGEXES: Record<DataTypes, RegExp[]> = {
  [DataTypes.dateTime]: [/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+ [+-]\d{2}:\d{2}$/],
  [DataTypes.date]: [/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/],
  [DataTypes.email]: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/],
  [DataTypes.integer]: [/^[0-9]*$/],
  [DataTypes.float]: [/^[-+]?[0-9]*\.?[0-9]+$/],
  [DataTypes.text]: [/.*/],
  [DataTypes.unknown]: [],
}

export const DATA_TYPES_WIDTHS: Record<DataTypes, number> = {
  [DataTypes.dateTime]: 230,
  [DataTypes.date]: 200,
  [DataTypes.email]: 200,
  [DataTypes.integer]: 200,
  [DataTypes.text]: 200,
  [DataTypes.float]: 200,
  [DataTypes.unknown]: 200,
}

export interface IChDataRow {
  [key: string]: unknown;

  CH_ROW_ID: string;
  CH_ROW_COLS_ERRORS?: {
    [key: string]: string
  };
  CH_ROW_ERROR?: string,
  CH_COL_TYPES: {
    [key: string]: DataTypes
  }
}

export interface IChDataColumn {
  key: string,
  label: string;
  type: DataTypes;
  width: number;
}

export interface IChDataSourceState<TData extends IChDataRow> {
  visibleData: TData[];
  isLoading: boolean;
  columns: IChDataColumn[];
}

export abstract class ChTableDataSourceStore<TState extends IChDataSourceState<TData>, TData extends IChDataRow> extends Store<TState> {
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly visibleData$ = this.select(({ visibleData }) => visibleData);
  readonly columns$ = this.select(({ columns }) => columns);

  protected constructor(initialState: TState) {
    super(initialState);
  }
}

export abstract class ChTableDataSource<TSource, TData extends IChDataRow> extends DataSource<TData> {

  abstract readonly columns$: Observable<IChDataColumn[]>;

  abstract changeCase(stringCase: 'lower' | 'upper', columnKey: string, index?: number): void;
}

export abstract class GenChTableDataSource<
  TDataSource extends ChTableDataSourceStore<TState, TData>,
  TState extends IChDataSourceState<TData>,
  TData extends IChDataRow
> extends ChTableDataSource<TData, TData> {

  readonly columns$ = this._store.columns$;

  protected constructor(protected readonly _store: TDataSource) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this._store.visibleData$;
  }

  disconnect(collectionViewer: CollectionViewer): void {}
}

