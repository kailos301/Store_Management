import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Moment } from 'moment';
import momentDate from 'moment';

export interface MatPickerArgs {
  event: any;
  dt: MatDatepicker<Moment>;
}
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMM YYYY',
  },
};
@Component({
  selector: 'app-month-date-picker',
  templateUrl: './month-date-picker.component.html',
  styleUrls: ['./month-date-picker.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class MonthDatePickerComponent implements OnInit {

  @Input() monthDate: FormControl;
  @Output() monthChange = new EventEmitter<MatPickerArgs>();
  @Input() type: string;
  @ViewChild('mpPicker', { static: true, read: MatInput }) monthdateId: MatInput;
  @ViewChild('dp', { static: true, read: MatDatepicker }) monthDatePicker: MatDatepicker<Moment>;

  tomorrow = new Date();
  minDate = new Date(null);
  fromDate = new Date(null);


  constructor() {
  }

  ngOnInit() {
    this.tomorrow.setDate(this.tomorrow.getDate());
  }
  onDateChange(dateEvent, datepicker: MatDatepicker<Moment>) {
    this.monthChange.emit(dateEvent);
    datepicker.close();
  }
  toggle(dp) {
    if (dp.opened && this.type !== 'fromDate') {
      this.minDate = null;
      // tslint:disable-next-line
      const getFromDate = new Date(this.monthdateId.ngControl['viewModel']);
      let fromDate = getFromDate;
      fromDate = momentDate(fromDate).add(-11, 'month').toDate();
      fromDate = (fromDate > momentDate().toDate()) ? momentDate().toDate() : fromDate;
      this.fromDate =  fromDate;
      this.minDate = new Date(this.fromDate);
    }
  }

  @HostListener('window:scroll', ['$event'])
  scrollHandler(event) {
    this.monthDatePicker.close();
  }

}
