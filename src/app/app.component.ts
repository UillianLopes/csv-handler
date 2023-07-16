import { Component, OnInit } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { ChURLTableDataSource } from './ch-table/ch-table-csv.data-source';
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

  changeFile(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files && target.files[0];
    if (!file) {
      return;
    }
    this.dataSource.setSource(file);

  }

  changeCase(stringCase: 'upper' | 'lower', columnKey: string, index?: number): void {
    this.dataSource.changeCase(stringCase, columnKey, index)
  }

  ngOnInit (): void {
    this.dataSource.setSource('/assets/table.csv');
  }

}
