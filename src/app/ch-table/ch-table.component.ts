import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component, ContentChild, ContentChildren,
  effect,
  Input,
  OnDestroy,
  OnInit, QueryList,
  signal,
  TrackByFunction, ViewChild,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ChTableDataSource, DataTypes } from "./ch-table.data-source";
import { CollectionViewer, ListRange } from '@angular/cdk/collections';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { Store } from '../core/utils/store';
import { ChCellDirective, ChTableColDirective } from './ch-table-col.directive';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

export enum ChTableColumnType {
  date = "date",
  text = "text",
  number = "number",
}

export interface ChTableColumn {
  key: string;
  type: ChTableColumnType;
}


@Component({
  selector: "ch-table",
  templateUrl: "./ch-table.component.html",
  styleUrls: ["./ch-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChTableComponent<TDataSource extends ChTableDataSource<any, any>>
  implements CollectionViewer, OnDestroy, AfterContentInit {

  private readonly unsubscribe$ = new Subject<void>();

  readonly dataSource$ = signal<TDataSource | null>(null);
  readonly items$ = signal<readonly any[]>([]);
  readonly itemSize$ = signal<number>(40);
  readonly customCols$ = signal<{ [p in DataTypes]: ChTableColDirective } | null>(null);

  readonly viewChange$ = new Subject<ListRange>()
  readonly viewChange = this.viewChange$.asObservable();
  readonly trackBy: TrackByFunction<any> = (index: number, value: any) => value['CH_ROW_ID'];

  @ContentChildren(ChTableColDirective) cols!: QueryList<ChTableColDirective>;

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;


  readonly types = Object.values(DataTypes);

  @Input()
  set dataSource(value: TDataSource | null) {
    this.dataSource$.set(value);
  }

  get dataSource(): TDataSource | null {
    return this.dataSource$();
  }

  @Input()
  set itemSize(itemSize: number) {
    this.itemSize$.set(itemSize);
  }

  setCurrentIndex(index: number) {
    const dataSource = this.dataSource$();

    if (!dataSource || !this.viewport || this.viewport.measureScrollOffset('bottom') > 20) {
      return;
    }

    dataSource.loadMore();
  }

  changeCase(stringCase: 'lower' | 'upper', columnKey: string, index?: number) {
    const dataSource = this.dataSource$();

    if (!dataSource) {
        return;
    }

    dataSource.changeCase(stringCase, columnKey, index);
  }

  listenToItems(): void {
    this.dataSource$()
      ?.connect(this)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((items) => this.items$.set(items));
  }

  listenToCols(): void {
    this.applyCustomCols(this.cols.toArray());
    this.cols
      .changes
      .pipe(
        startWith(this.cols),
        map((cols) => this.cols.toArray()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (cols) => this.applyCustomCols(cols)
      );
  }

  ngAfterContentInit(): void {
    this.listenToItems();
    this.listenToCols();
  }

  private applyCustomCols(cols: ChTableColDirective[]) {
    const colsConfig =  Object.fromEntries(
      cols.map((col) => [col.dataType, col])
    );

    if (!colsConfig) {
      this.customCols$() && this.customCols$.set(null);
      return;
    }

    this.customCols$.set(colsConfig as { [p in DataTypes]: ChTableColDirective });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


}
