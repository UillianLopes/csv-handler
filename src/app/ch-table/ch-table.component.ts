import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, TrackByFunction, } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ChTableDataSource } from "./ch-table.data-source";
import { CollectionViewer, ListRange } from '@angular/cdk/collections';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from './store';

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
export class ChTableComponent<TDataSource extends ChTableDataSource<any>>
  extends Store<{ items: readonly any[] }>
  implements CollectionViewer, OnInit, OnDestroy {

  @Input() dataSource: TDataSource | null = null;

  trackBy: TrackByFunction<any> = (index: number, value: any) => value['CH_ROW_ID'];

  viewChange!: Observable<ListRange>;
  items$ = this.select(({ items }) => items);

  constructor(private readonly httpClient: HttpClient) {
    super({
      items: []
    })
  }

  ngOnInit(): void {
    if (!this.dataSource) {
      return;
    }

    this.dataSource
      .connect(this)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((items) => {
        this.patchSate({
          items
        })
      });
  }


}
