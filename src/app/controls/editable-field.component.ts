import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EventEmitter,
  forwardRef,
  Input, OnDestroy,
  Optional, Output, Self,
  signal
} from '@angular/core';
import { NgIf } from '@angular/common';
import { EditableFieldInputComponent } from './editable-field-input.component';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl,
  ReactiveFormsModule, ValidationErrors, Validator,
  ValidatorFn
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

export type FieldType = 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | 'datetime-local';

@Component({
  standalone: true,
  selector: 'true-editable-field',
  templateUrl: './editable-field.component.html',
  styleUrls: ['./editable-field.component.scss'],
  imports: [
    NgIf,
    EditableFieldInputComponent,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableFieldComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditableFieldComponent),
      multi: true
    }
  ]
})
export class EditableFieldComponent implements ControlValueAccessor, Validator, OnDestroy {
  private readonly unsubscribe$ = new Subject<void>();

  readonly type$ = signal<FieldType>('text');
  readonly validators$ = signal<ValidatorFn[]>([]);
  readonly disabled$ = signal<boolean>(false);
  readonly value$ = signal<any>(null);
  readonly errors$ = signal<ValidationErrors | null>(null);

  @Input()
  set type(value: FieldType) {
    this.type$.set(value);
  }

  @Input()
  set validators(value: ValidatorFn[]) {
    this.validators$.set(value);
  }

  readonly input = new FormControl();

  private _onChange?: (value: any) => void;
  private _onTouched?: () => void;

  @Output() readonly confirmed = new EventEmitter<any>();

  constructor() {
    effect(() => {
      const validators = this.validators$();
      validators?.length && this.input.setValidators(validators);
    });

    effect(() => {
      const type = this.type$();
      this.input.reset();
    });

    this.input
      .valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
      ).subscribe((value) => {
        this._onChange?.(value);
        this._onTouched?.();
      });
  }


  confirm(event?: Event): void {
    if (this.errors$()) {
      event?.preventDefault();
      return;
    }

    const value = this.input.value;
    this.value$.set(value);
    this.input.markAsPristine();
    this.confirmed.emit(value);
  }

  cancel(): void {
    this.input.setValue(this.value$());
    this.input.markAsPristine();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled$.set(isDisabled);
  }

  writeValue(obj: any): void {
    this.input.setValue(obj);
    this.value$.set(obj);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    this.errors$.set(null);

    const errorsArray =  this.validators$()
      .map((validator) => validator(control))
      .filter((errors) => !!errors);

    if (errorsArray.length) {
      const errors = errorsArray
        .reduce((acc, errors) => ({ ...acc, ...errors }), {});
      this.errors$.set(errors);
    }

    return this.errors$();
  }

  ngOnDestroy (): void {
    if (this.input.dirty && !this.errors$()) {
      this.confirm();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
