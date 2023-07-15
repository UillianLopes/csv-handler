import { Directive, Input, TemplateRef } from '@angular/core';
import { DataTypes } from './ch-table.data-source';

@Directive({
  selector: 'chTableHeaderColDirective'
})
export class ChTableHeaderColDirective {
  @Input() dataType: DataTypes = DataTypes.text;

  constructor(readonly templateRef: TemplateRef<any>) {}
}
