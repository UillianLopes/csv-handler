import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstPageComponent } from './first-page.component';
import {FirstPageRouting} from './first-page.routing';

@NgModule({
  declarations: [
    FirstPageComponent
  ],
  imports: [
    CommonModule,
    FirstPageRouting
  ]
})
export class FirstPageModule { }
