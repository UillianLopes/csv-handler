import { Component, ContentChild, Directive, Input, TemplateRef } from '@angular/core';
import { DataTypes } from './ch-table.data-source';
class ChCellContext {
  $implicit: any;
  rowIndex: any;
  column: any;
}

class ChTypeSelectionCellContext {
  $implicit: any;
}

class ChHeaderCellContext {
  $implicit: any;
}
@Directive({
  selector: '[chTableCell]'
})
export class ChCellDirective {
  constructor(readonly templateRef: TemplateRef<ChCellContext>) { }

  static ngTemplateContextGuard(
    directive: ChCellDirective,
    context: unknown
  ): context is ChCellContext {
    return true;
  }
}

@Directive({
  selector: '[chHeaderTableCell]'
})
export class ChHeaderCellDirective {
  constructor(readonly templateRef: TemplateRef<ChHeaderCellContext>) { }

  static ngTemplateContextGuard(
    directive: ChHeaderCellDirective,
    context: unknown
  ): context is ChHeaderCellContext {
    return true;
  }
}


@Directive({
  selector: '[chTypeSelectionCell]'
})
export class ChTypeSelectionCellDirective {
  constructor(readonly templateRef: TemplateRef<ChTypeSelectionCellContext>) { }

  static ngTemplateContextGuard(
    directive: ChTypeSelectionCellDirective,
    context: unknown
  ): context is ChTypeSelectionCellContext {
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
  @ContentChild(ChTypeSelectionCellDirective) typeSelectionCell?: ChTypeSelectionCellDirective;
}


