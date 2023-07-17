import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'input[trueEditableFieldInput], textarea[trueEditableFieldInput], select[trueEditableFieldInput]',
  template: '',
  styleUrls: ['./editable-field-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditableFieldInputComponent {}
