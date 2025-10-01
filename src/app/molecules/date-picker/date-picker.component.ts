/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  standalone: false,
})
export class DatePickerComponent {
  @Input()
  public label: string;

  @Input()
  public placeholder: string;

  @Input()
  public value: any;

  @Input()
  public required: boolean = false;

  @Output()
  public valueChange: EventEmitter<Date> = new EventEmitter<Date>();

  public updateValue(date: Date | number | string): void {
    const d = <Date>date;
    this.value = d;
    this.valueChange.emit(d);
  }
}
