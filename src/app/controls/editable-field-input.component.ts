import { ChangeDetectionStrategy, Component, Directive, forwardRef, HostBinding, HostListener } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';

@Component({
  standalone: true,
  selector: 'input[trueEditableFieldInput], textarea[trueEditableFieldInput], select[trueEditableFieldInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableFieldInputDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditableFieldInputDirective),
      multi: true,
    }
  ],
  template: '',
  styleUrls: ['./editable-field.component.scss'],
})
export class EditableFieldInputDirective implements ControlValueAccessor, Validator {
  @HostBinding('value')
  value: any;

  @HostBinding('disabled')
  disabled = false;

  @HostBinding('readonly')
  readonly = false;

  @HostListener('input', ['$event'])
  onInput($event: InputEvent) {
      console.log($event);
  }

  private _onChange?: (value: any) => void;
  private _onTouched?: () => void;

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }
}
