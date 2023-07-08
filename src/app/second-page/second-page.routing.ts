import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SecondPageComponent } from './second-page.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: SecondPageComponent
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class SecondPageRouting {
}
