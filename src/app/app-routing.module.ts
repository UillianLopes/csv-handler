import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'first', loadChildren: () => import('./first-page/first-page.module').then(m => m.FirstPageModule) },
  { path: 'second', loadChildren: () => import('./second-page/second-page.module').then(m => m.SecondPageModule), outlet: 'aux' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
