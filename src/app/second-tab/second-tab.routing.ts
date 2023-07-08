import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SecondTabComponent } from './second-tab.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: SecondTabComponent
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class SecondTabRouting { }
