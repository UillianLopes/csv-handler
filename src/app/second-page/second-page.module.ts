import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondPageComponent } from './second-page.component';
import {SecondPageRouting} from './second-page.routing';



@NgModule({
  declarations: [
    SecondPageComponent
  ],
  imports: [
    CommonModule,
    SecondPageRouting
  ]
})
export class SecondPageModule { }
