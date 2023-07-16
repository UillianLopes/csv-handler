import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ChTableModule } from './ch-table/ch-table.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { EditableFieldComponent } from './controls/editable-field.component';
import { EditableFieldInputComponent } from './controls/editable-field-input.component';
import { MenuModule } from './menu/menu.module';
import { StringToDatePipe } from './string-to-date.pipe';
import { EllipsisTextComponent } from './ellipsis-text/ellipsis-text.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChTableModule,
    HttpClientModule,
    FormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    EditableFieldComponent,
    EditableFieldInputComponent,
    MenuModule,
    StringToDatePipe,
    EllipsisTextComponent
  ],
  providers: [
    provideNgxMask()
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
