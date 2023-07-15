import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChTableComponent } from "./ch-table.component";
import { CdkTableModule } from "@angular/cdk/table";
import {
  CdkFixedSizeVirtualScroll, CdkScrollable, CdkVirtualForOf,
  CdkVirtualScrollableElement,
  CdkVirtualScrollViewport
} from '@angular/cdk/scrolling';
import { ChCellDirective, ChHeaderCellDirective, ChTableColDirective } from './ch-table-col.directive';

@NgModule({
  declarations: [
    ChTableComponent,
    ChTableColDirective,
    ChCellDirective,
    ChHeaderCellDirective
  ],
  imports: [
    CommonModule,
    CdkTableModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollableElement,
    CdkScrollable,
    CdkVirtualForOf
  ],
  exports: [
    ChTableComponent,
    ChTableColDirective,
    ChCellDirective,
    ChHeaderCellDirective
  ]
})
export class ChTableModule {}
