import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FirstTabComponent } from './first-tab.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FirstTabComponent
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class FirstTabRouting { }
