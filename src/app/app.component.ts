import { Component, OnInit } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { ChURLTableDataSource } from './ch-table/ch-table-csv-url.data-source';
import { DataTypes } from './ch-table/ch-table.data-source';
import { Validators } from '@angular/forms';

@Component({
  selector: "ch-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

  readonly dataSource = new ChURLTableDataSource(this.httpClient);
  readonly DataTypes = DataTypes;

  readonly emailValidators = [Validators.email];

  constructor (private readonly httpClient: HttpClient) {
  }
  changeCase(stringCase: 'upper' | 'lower', columnKey: string, index?: number): void {
    this.dataSource.changeCase(stringCase, columnKey, index)
  }
  ngOnInit (): void {
    this.dataSource.setUrl('/assets/table.csv');
    this.dataSource.load();
  }

}
