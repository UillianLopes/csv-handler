import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondTabComponent } from './second-tab.component';
import { SecondTabRouting } from './second-tab.routing';

@NgModule({
  declarations: [
    SecondTabComponent
  ],
  imports: [
    CommonModule,
    SecondTabRouting
  ]
})
export class SecondTabModule { }
