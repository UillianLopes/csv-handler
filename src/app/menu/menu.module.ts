import { NgModule } from '@angular/core';
import { ContextMenuComponent } from './context-menu.component';
import { ContextMenuDirective } from './context-menu.directive';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [ContextMenuComponent, ContextMenuDirective],
  imports: [OverlayModule],
  exports: [ContextMenuComponent, ContextMenuDirective]
})
export class ContextMenuModule {}
