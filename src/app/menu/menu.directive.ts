
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Directive, ElementRef, HostListener, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { combineLatest, filter, fromEvent, merge, Observable, Subject, takeUntil, tap } from 'rxjs';

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

export function eventOutsideOverlay(
  eventName: string,
  overlayRef: OverlayRef,
  origin: HTMLElement
): Observable<Event> {
  return fromEvent<Event>(document, eventName).pipe(
    filter((event) => {

      console.log('SEVENT -> ', event.target);
      const clickTarget = event.target as HTMLElement;

      const notOrigin = clickTarget !== origin;
      const notOriginChild = !origin.contains(clickTarget);

      const notOverlay = overlayRef
        && !overlayRef.overlayElement.contains(clickTarget);

      return notOrigin && notOverlay && notOriginChild;
    }),
    takeUntil(overlayRef.detachments())
  );
}

@Directive({
  selector: '[chMenu]',
})
export class MenuDirective implements OnInit {
  private readonly destroyed$ = new Subject<void>();

  @Input('chMenu') template?: TemplateRef<any>;

  @Input() trigger: 'rightClick' | 'click' | 'hover' = 'click';

  @Input() position: ChOverlayPosition = ChOverlayPosition.bottom
  @Input() target?: ElementRef<any>;
  @Input() data?: any;
  @Input() backdropClass?: string;
  @Input() hasBackdrop = false;

  private overlayRef?: OverlayRef;

  constructor(
    private readonly overlay: Overlay,
    private readonly elementRef: ElementRef<any>,
    private readonly viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit (): void {
    merge(
      fromEvent<MouseEvent>(this.elementRef.nativeElement, 'contextmenu').pipe(filter(() => this.trigger === 'rightClick')),
      fromEvent<MouseEvent>(this.elementRef.nativeElement, 'click').pipe(filter(() => this.trigger === 'click')),
      fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter').pipe(filter(() => this.trigger === 'hover')),
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((event) => {
        event.preventDefault();
        this.open();
      });
  }

  open(): void {
    if (!this.template) {
      return;
    }

    this.close();

    const overlay = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.target ?? this.elementRef)
        .withPositions(POSITIONS[this.position]),
      scrollStrategy: this.overlay
        .scrollStrategies
        .reposition(),
      hasBackdrop: this.hasBackdrop,
      backdropClass: this.backdropClass
    })

    const portal = new TemplatePortal(
      this.template,
      this.viewContainerRef,
      { $implicit: this.data, overlayRef: overlay }
    );

    overlay.attach(portal);

    this.overlayRef = overlay;

    if (this.hasBackdrop){
      overlay
        .backdropClick()
        .pipe(
          takeUntil(this.destroyed$),
          takeUntil(this.overlayRef.detachments())
        )
        .subscribe(() => this.close());
    } else {
      switch(this.trigger) {
        case 'click':
        case 'rightClick':
          eventOutsideOverlay('click', overlay, this.elementRef.nativeElement)
            .pipe(takeUntil(this.destroyed$), takeUntil(this.overlayRef.detachments()))
            .subscribe(() => this.close());
          break;
        case 'hover':
          fromEvent(this.elementRef.nativeElement, 'mouseleave')
            .pipe(takeUntil(this.destroyed$), takeUntil(this.overlayRef.detachments()))
            .subscribe(() => this.close());
          break;
      }
    }
  }

  close(): void {
    if (!this.overlayRef) {
      return;
    }

    this.overlayRef.detach();
    this.overlayRef.dispose();
    this.overlayRef = undefined;
  }
}
