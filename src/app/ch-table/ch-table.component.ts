import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {SafeUrl} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";
export enum ChTableColumnType {
  date ='date',
  text = 'text',
  number = 'number',
}

export interface ChTableColumn {
  key: string;
  type: ChTableColumnType;
}

@Component({
  selector: 'ch-table',
  templateUrl: './ch-table.component.html',
  styleUrls: ['./ch-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChTableComponent<T> implements OnInit {
  @Input() columnLabels: Record<string, string> | null = null;
  @Input() columns: ChTableColumn[] | null = null;
  @Input() source: SafeUrl | string | T[] | null = null;

  constructor(
    private readonly httpClient: HttpClient
  ) { }
  ngOnInit() {

  }
}
