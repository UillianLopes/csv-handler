import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstTabComponent } from './first-tab.component';
import { FirstTabRouting } from './first-tab.routing';



@NgModule({
  declarations: [
    FirstTabComponent
  ],
  imports: [
    CommonModule,
    FirstTabRouting
  ]
})
export class FirstTabModule { }
