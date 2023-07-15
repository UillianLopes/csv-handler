import { Component, ContentChild, Directive, Input, TemplateRef } from '@angular/core';
import { DataTypes } from './ch-table.data-source';
class ChCelContext {
  $implicit: any;
  rowIndex: any;
  column: any;
}

class ChHeaderCelContext {
  $implicit: any;
}
@Directive({
  selector: '[chTableCell]'
})
export class ChCellDirective {
  constructor(readonly templateRef: TemplateRef<ChCelContext>) { }

  static ngTemplateContextGuard(
    directive: ChCellDirective,
    context: unknown
  ): context is ChCelContext {
    return true;
  }
}

@Directive({
  selector: '[chHeaderTableCell]'
})
export class ChHeaderCellDirective {
  constructor(readonly templateRef: TemplateRef<ChHeaderCelContext>) { }

  static ngTemplateContextGuard(
    directive: ChHeaderCellDirective,
    context: unknown
  ): context is ChHeaderCelContext {
    return true;
  }
}

@Directive({
  selector: '[chTableCol]',
})
export class ChTableColDirective {
  @Input('chTableCol') dataType: DataTypes = DataTypes.text;
  @ContentChild(ChCellDirective) cell?: ChCellDirective;
  @ContentChild(ChHeaderCellDirective) headerCell?: ChHeaderCellDirective;
}


