import { NgModule } from '@angular/core';
import { MenuComponent } from './menu.component';
import { MenuDirective } from './menu.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import { MenuItemComponent } from './menu-item/menu-item.component';

@NgModule({
  declarations: [MenuComponent, MenuItemComponent, MenuDirective],
  imports: [OverlayModule],
  exports: [MenuComponent, MenuItemComponent, MenuDirective]
})
export class MenuModule {}
