import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChTableComponent } from "./ch-table.component";
import { CdkTableModule } from "@angular/cdk/table";
import {
  CdkFixedSizeVirtualScroll, CdkScrollable, CdkVirtualForOf,
  CdkVirtualScrollableElement,
  CdkVirtualScrollViewport
} from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    ChTableComponent
  ],
  imports: [CommonModule, CdkTableModule, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualScrollableElement, CdkScrollable, CdkVirtualForOf],
  exports: [
    ChTableComponent
  ]
})
export class ChTableModule {}
