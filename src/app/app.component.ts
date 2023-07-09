import { Component, OnInit } from "@angular/core";
import { ChURLTableDataSource } from './ch-table/ch-table.data-source';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "ch-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

  readonly dataSource = new ChURLTableDataSource(this.httpClient);

  constructor (private readonly httpClient: HttpClient) {
  }

  ngOnInit (): void {
    this.dataSource.setSource("/assets/table.csv");
  }

}
