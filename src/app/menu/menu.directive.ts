
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Directive, ElementRef, HostListener, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';

export enum ChOverlayPosition {
  top,
  left,
  bottom,
  right
}

const TOP_CENTER: ConnectedPosition =   {
  overlayY: 'bottom',
  originY: 'top',
  overlayX: 'center',
  originX: 'center'
}

const BOTTOM_CENTER: ConnectedPosition =   {
  overlayY: 'top',
  originY: 'bottom',
  overlayX: 'center',
  originX: 'center'
}

const RIGHT_CENTER: ConnectedPosition =   {
  overlayY: 'center',
  originY: 'center',
  overlayX: 'start',
  originX: 'end'
}

const LEFT_CENTER: ConnectedPosition =   {
  overlayY: 'center',
  originY: 'center',
  overlayX: 'end',
  originX: 'start'
}

const POSITIONS: { [key in ChOverlayPosition]: ConnectedPosition[] } = {
  [ChOverlayPosition.top]: [TOP_CENTER, BOTTOM_CENTER, LEFT_CENTER, RIGHT_CENTER],
  [ChOverlayPosition.left]: [LEFT_CENTER, RIGHT_CENTER, TOP_CENTER, BOTTOM_CENTER],
  [ChOverlayPosition.right]: [RIGHT_CENTER, LEFT_CENTER, TOP_CENTER, BOTTOM_CENTER],
  [ChOverlayPosition.bottom]: [BOTTOM_CENTER, TOP_CENTER, LEFT_CENTER, RIGHT_CENTER],
}

@Directive({
  selector: '[chContextMenu]',
})
export class ContextMenuDirective {
  @Input('chContextMenu') template?: TemplateRef<any>;

  @Input() position: ChOverlayPosition = ChOverlayPosition.bottom
  @Input() target?: ElementRef<any>;
  @Input() data?: any;

  private overlayRef?: OverlayRef;

  constructor(
    private readonly overlay: Overlay,
    private readonly elementRef: ElementRef<any>,
    private readonly viewContainerRef: ViewContainerRef
  ) { }

  @HostListener('contextMenu', ['$event'])
  contextMenu(event: MouseEvent) {
    if (!this.template) {
      return;
    }
    event.preventDefault();

    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }

    const overlay = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.target ?? this.elementRef)
        .withPositions(POSITIONS[this.position]),
      scrollStrategy: this.overlay
        .scrollStrategies
        .reposition()
    })

    const portal = new TemplatePortal(this.template, this.viewContainerRef, { $implicit: this.data });

    overlay.attach(portal);

    this.overlayRef = overlay;
  }
}
