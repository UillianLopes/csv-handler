import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  Observer,
  of,
  Subject,
  take,
  takeUntil,
} from "rxjs";
import { Injectable, OnDestroy } from "@angular/core";
type Callback<TState, TParams extends any[]> = (
  state: TState,
  ...params: TParams
) => TState;

@Injectable()
export abstract class Store<TState> implements OnDestroy {
  protected readonly destroyed$ = new Subject<void>();

  private readonly state$$ = new BehaviorSubject(this.initialState);

  get state() {
    return this.state$$.value;
  }

  set state(state: TState) {
    this.state$$.next(state);
  }

  protected constructor(private readonly initialState: TState) {}

  protected select<R>(callback: (state: TState) => R): Observable<R> {
    return this.state$$.pipe(
      map((state) => callback(state)),
      distinctUntilChanged(),
    );
  }

  protected updater<TParams extends any[]>(
    callback: Callback<TState, TParams>,
  ): (...params: TParams) => TState {
    return (...params: TParams) => {
      this.state = callback(this.state, ...params);
      return this.state;
    };
  }

  protected effect<T, R = T>(
    callback: (event$: Observable<T>) => Observable<R>,
    observer?: Partial<Observer<R>>,
  ) {
    const subject = new Subject<T>();

    callback(subject)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(observer);

    return (value: T) => {
      subject.next(value);
    };
  }

  protected patchSate(state: Partial<TState>) {
    this.state = {
      ...this.state$$.value,
      ...state,
    };
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
}
