import { Component, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FirstPageComponent } from './first-page.component';

@Component({
  standalone: true,
  selector: 'app-dumb',
  template: ''
})
export  class DumbComponent { }
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FirstPageComponent,
        children: [
          {
            path: 'first-tab',
            loadChildren: () => import('../first-tab/first-tab.module').then((m) => m.FirstTabModule),
          },
          {
            path: 'second-tab',
            loadChildren: () => import('../second-tab/second-tab.module').then((m) => m.SecondTabModule),
            outlet: 'aux2'
          },
          {
            path: '',
            redirectTo: '/',
            pathMatch: 'full'
          }
        ]
      },
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class FirstPageRouting {
}
