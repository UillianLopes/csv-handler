import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    name: 'stringToDate'
})
export class StringToDatePipe implements PipeTransform {
    transform(value: string): Date {
      return new Date(value);
    }
}
