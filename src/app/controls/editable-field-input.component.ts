import {
  Component,
  forwardRef,
  Input
} from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator, ValidatorFn
} from '@angular/forms';

@Component({
  standalone: true,
  selector: 'input[trueEditableFieldInput], textarea[trueEditableFieldInput], select[trueEditableFieldInput]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditableFieldInputComponent),
      multi: true,
    }
  ],
  template: '',
  styleUrls: ['./editable-field-input.component.scss'],
})
export class EditableFieldInputComponent implements Validator {

  @Input() validators: ValidatorFn[] = [];

  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.validators?.length) {
      return null;
    }

    const errors =  this.validators
      .map((validator) => validator(control))
      .filter((errors) => !!errors);

    if (!errors.length) {
      return null;
    }

    return errors.reduce((acc, errors) => ({ ...acc, ...errors }), {});
  }
}
