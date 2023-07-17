import { Component, OnDestroy, OnInit } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { ChURLTableDataSource, Delimiter } from './ch-table/ch-table-csv.data-source';
import { DataTypes } from './ch-table/ch-table.data-source';
import { FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: "ch-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {

  readonly unsubscribe$$ = new Subject<void>();
  readonly dataSource = new ChURLTableDataSource(this.httpClient);
  readonly DataTypes = DataTypes;
  readonly emailValidators = [Validators.email];
  readonly delimiterControl = new FormControl<Delimiter>(',');

  constructor(private readonly httpClient: HttpClient) { }

  changeFile(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files && target.files[0];
    if (!file) {
      return;
    }

    target.value = '';
    this.dataSource.setSource(file);

  }

  changeCase(stringCase: 'upper' | 'lower', columnKey: string, index?: number): void {
    this.dataSource.changeCase(stringCase, columnKey, index)
  }

  ngOnInit (): void {
    this.dataSource.setSource('/assets/table.csv');


    this.delimiterControl
      .valueChanges
      .pipe(takeUntil(this.unsubscribe$$))
      .subscribe((value) => {
        if (!value) {
          return;
        }

        this.dataSource.setDelimiter(value);
      });
  }

  loadMore(): void {
    this.dataSource.loadMore();
  }

  updateValue(value: string, columnKey: string, index: number): void {
    this.dataSource.updateValue(value, columnKey, index);
  }

  ngOnDestroy(): void {
    this.unsubscribe$$.next();
    this.unsubscribe$$.complete();
  }

}
