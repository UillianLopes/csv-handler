import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'true-editable-field',
  templateUrl: './editable-field.component.html',
  styleUrls: ['./editable-field.component.scss'],
  imports: [
    NgIf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditableFieldComponent {}
