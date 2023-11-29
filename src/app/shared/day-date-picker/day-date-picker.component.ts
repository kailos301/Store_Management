import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import momentDate, { Moment } from 'moment';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-day-date-picker',
  templateUrl: './day-date-picker.component.html',
  styleUrls: ['./day-date-picker.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DayDatePickerComponent implements OnInit {

  @Input() dayDate: FormControl;
  @Output() dayChange = new EventEmitter<any>();
  @Input() type: string;
  @ViewChild('dpPicker', { static: true, read: MatInput }) daydateId: MatInput;
  @ViewChild('dp', { static: true, read: MatDatepicker }) monthDatePicker: MatDatepicker<Moment>;

  tomorrow = new Date();
  minDate = new Date(null);
  fromDate = new Date(null);

  constructor() {
  }

  ngOnInit() {
    this.tomorrow.setDate(this.tomorrow.getDate());
  }

  onDateChange(dateEvent) {
    if (dateEvent.value !== undefined) {
      this.dayChange.emit(dateEvent.value);
    }
  }
  toggle(dp) {
    if (dp.opened && this.type !== 'fromDate') {
      this.minDate = null;
      // tslint:disable-next-line
      const getFromDate = new Date(this.daydateId.ngControl['viewModel']);
      let frDate = getFromDate;
      frDate = (momentDate(getFromDate).add(-30, 'day')).toDate();
      frDate = (frDate > momentDate().toDate()) ? momentDate().toDate() : frDate;
      this.fromDate =  frDate;
      this.minDate = new Date(this.fromDate);
    }
  }

  @HostListener('window:scroll', ['$event'])
  scrollHandler(event) {
    this.monthDatePicker.close();
  }

}
