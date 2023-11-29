import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DayType, Utils } from 'src/app/stores/utils/Utils';

@Component({
  selector: 'app-go-timepicker',
  templateUrl: './go-timepicker.component.html',
  styleUrls: ['./go-timepicker.component.scss']
})
export class GoTimepickerComponent implements OnInit, OnChanges, OnDestroy {

  // @Input() selectedLang$: Observable<string>;
  @Input() inputTime: Date;
  // @Input() showMeridian: boolean;
  @Input() hoursStep: number;
  @Input() minutesStep: number;
  @Input() disabled: boolean;

  @Output() timeChanged = new EventEmitter<Date>();

  currentTime: Dayjs;
  minutes = 0;
  hours = 0;
  minutesFormatted = '';
  hoursFormatted = '';

  invalidHours = false;
  invalidMinutes = false;

  timepickerForm: FormGroup;

  private destroy$ = new Subject();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(isBetween);

    this.timepickerForm = this.fb.group({
      minutesInput: new FormControl(
        { value: '00', disabled: true },
        Validators.compose([
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2),
          Validators.pattern(/^[0-9]\d*$/)
        ])
      ),
      hoursInput: new FormControl(
        { value: '00', disabled: true },
        Validators.compose([
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2),
          Validators.pattern(/^[0-9]\d*$/)
        ])
      ),
    });

    this.currentTime = dayjs();

  }

  ngOnChanges(changes: SimpleChanges) {
    this.renderTime(this.inputTime);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // reducing hour is disabled based on current time & hour step
  reduceHoursDisabled() {
    this.currentTime = dayjs();
    const deltaHours = this.hoursStep ? this.hoursStep : 1;
    if (this.inputTime && dayjs(this.inputTime).subtract(deltaHours, 'hour').isBefore(this.currentTime)) {
      return true;
    }
    return false;
  }

  // reducing minute is disabled based on current time & minute step
  reduceMinutesDisabled() {
    this.currentTime = dayjs();
    const deltaMinutes = this.minutesStep ? this.minutesStep : 1;
    if (this.inputTime && dayjs(this.inputTime).subtract(deltaMinutes, 'minute').isBefore(this.currentTime)) {
      return true;
    }
    return false;
  }

  increaseHours() {
    const deltaHours = this.hoursStep ? this.hoursStep : 1;
    const newDate = dayjs(this.inputTime).add(deltaHours, 'hour').toDate();
    this.timeChanged.emit(newDate);
  }

  reduceHours() {
    if (this.reduceHoursDisabled()) {
      return false;
    }
    const deltaHours = this.hoursStep ? this.hoursStep : 1;
    const newDate = dayjs(this.inputTime).subtract(deltaHours, 'hour').toDate();
    this.timeChanged.emit(newDate);
  }

  increaseMinutes() {
    const deltaMinutes = this.minutesStep ? this.minutesStep : 1;
    const newDate = dayjs(this.inputTime).add(deltaMinutes, 'minute').toDate();
    this.timeChanged.emit(newDate);
  }

  reduceMinutes() {
    if (this.reduceMinutesDisabled()) {
      return false;
    }
    const deltaMinutes = this.minutesStep ? this.minutesStep : 1;
    const newDate = dayjs(this.inputTime).subtract(deltaMinutes, 'minute').toDate();
    this.timeChanged.emit(newDate);
  }

  renderTime(input: Date) {
    if (input) {
      this.hours = input.getHours();
      this.hoursFormatted = Utils.padNumber(this.hours);
      this.minutes = input.getMinutes();
      this.minutesFormatted = Utils.padNumber(this.minutes);
    } else {
      this.hours = 0;
      this.hoursFormatted = '';
      this.minutes = 0;
      this.minutesFormatted = '';
    }
  }

}
