import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { StoresState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { CreateSchedule, UpdateSchedule, DeleteSchedule } from '../+state/stores-schedule.actions';
import { Schedule } from '../stores-schedule';
import { ToastrService } from 'ngx-toastr';
import { getSelectedSchedule, getSelectedScheduleStatus } from '../+state/stores-schedule.selectors';
import { DateAdapter } from '@angular/material/core';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
@Component({
  selector: 'app-store-settings-schedule-item',
  templateUrl: './schedule-item.component.html',
  styleUrls: ['./schedule-item.component.scss']
})
export class ScheduleItemComponent implements OnInit, OnDestroy {
  isCreateScheduleItem = false;
  availabilityList: any = [];
  availabilityForm: FormGroup;
  private destroy$ = new Subject();
  contentItemId: number;
  storeId: any;
  scheduleId: any;
  scheduleItems: any = [];
  schedule: Schedule;
  catalogId: any;
  offerId: any;
  offerName: string;
  categoryId: any;
  categoryName: string;
  backLink: string;
  scheduleStatus: string;


  constructor(
    private store: Store<any>,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private translateSer: TranslateService,
    private dateAdapter: DateAdapter<any>
  ) { }

  ngOnInit() {

    document.getElementById('settingsTabs').style.display = 'none';
    document.getElementById('settingsHeader').style.display = 'none';

    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ). subscribe(loggedInUser => {
      if (loggedInUser && loggedInUser.preferredLanguage && loggedInUser.preferredLanguage.locale) {
        const locale = loggedInUser.preferredLanguage.locale;
        this.dateAdapter.setLocale(locale);
      }
    });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getSelectedStore)
    ).subscribe(s => {
      this.storeId = s.id;
    });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getSelectedSchedule)
    ).subscribe(s => {
      this.isCreateScheduleItem = (s.id === -1);
      this.schedule = s;
      this.scheduleItems = JSON.parse(JSON.stringify(s.availabilities));
      this.setForms();
    });
    this.store.pipe(
      select(getSelectedScheduleStatus),
      takeUntil(this.destroy$),
    ).subscribe(s => {
      this.scheduleStatus = s;
    });

    this.scheduleId = this.route.snapshot.params.scheduleId;
    this.catalogId = this.route.snapshot.queryParams.catalogId;
    this.offerId = this.route.snapshot.queryParams.offerId;
    this.offerName = this.route.snapshot.queryParams.offerName;
    this.categoryId = this.route.snapshot.queryParams.categoryId;
    this.categoryName = this.route.snapshot.queryParams.categoryName;

  }

  ngOnDestroy(): void {
    document.getElementById('settingsTabs').removeAttribute('style');
    document.getElementById('settingsHeader').removeAttribute('style');

    this.destroy$.next();
    this.destroy$.complete();
  }

  setForms() {
    for (const scheduleItem of this.scheduleItems) {
      scheduleItem.form = this.createForm(scheduleItem);
      if (!scheduleItem.daysOfWeek) {
        scheduleItem.daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      }
    }
  }

  createForm(item) {
    // date should be formatted in en-US locale because startTime and endTime are formatted in en-US locale.
    const dt = new Date().toLocaleDateString('en-US');
    const form = new FormGroup({});
    form.addControl('startTime', new FormControl(new Date(dt + ' ' + item.startTime), Validators.compose([Validators.required])));
    form.addControl('endTime', new FormControl(new Date(dt + ' ' + item.endTime), Validators.compose([Validators.required])));
    if (item.type === 'DATE_INCLUSIVE' || item.type === 'DATE_EXCLUSIVE') {
      form.addControl('schDate', new FormControl(new Date(item.date), Validators.compose([Validators.required])));
      form.addControl('dateType', new FormControl(item.type, Validators.compose([Validators.required])));
    }

    return form;
  }
  getTime(name, form) {
    const control = form.get(name);
    const time = new Date(control.value);

    const hr = time.getHours();
    const min = time.getMinutes();
    return (hr < 10 ? '0' + hr : hr) + ':' + (min < 10 ? '0' + min : min);
  }

  getDate(name, form) {
    const control = form.get(name);
    const date = new Date(control.value);

    const year = date.getFullYear();
    const mon = date.getMonth() + 1;
    const day = date.getDate();

    return year + '-' + (mon < 10 ? '0' + mon : mon) + '-' + (day < 10 ? '0' + day : day);
  }

  getType(name, form) {
    const control = form.get(name);

    return control.value;
  }

  setScheduleName(inp) {
    this.schedule.name = inp.target.value;
  }

  selectDay(eq, index) {
    if (!this.scheduleItems[index].daysOfWeek) {
      this.scheduleItems[index].daysOfWeek = [];
    }
    if (this.scheduleItems[index].daysOfWeek.includes(eq)) {
      this.scheduleItems[index].daysOfWeek.splice(this.scheduleItems[index].daysOfWeek.indexOf(eq), 1);
    } else {
      this.scheduleItems[index].daysOfWeek.push(eq);
    }
  }

  createSchedule() {
    const items = [];
    const scope = {};
    for (const scheduleItem of this.scheduleItems) {
      if (!scheduleItem.type || scheduleItem.type === 'DAYS_OF_WEEK') {
        const item = {
          id: scheduleItem.id,
          startTime: this.getTime('startTime', scheduleItem.form),
          endTime: this.getTime('endTime', scheduleItem.form),
          type: scheduleItem.type,
          daysOfWeek: scheduleItem.daysOfWeek,
        };
        if (!this.checkTimeAndDays(item)) { return; }
        for (const dayOfWeek of item.daysOfWeek) {
          if (!scope[dayOfWeek]) { scope[dayOfWeek] = []; }
          scope[dayOfWeek].push({
            startTime: item.startTime,
            endTime: item.endTime
          });
        }
        items.push(item);
      } else {
        const item = {
          id: scheduleItem.id,
          startTime: this.getTime('startTime', scheduleItem.form),
          endTime: this.getTime('endTime', scheduleItem.form),
          type: this.getType('dateType', scheduleItem.form),
          date: this.getDate('schDate', scheduleItem.form),
        };
        if (!this.checkTimeAndDays(item)) { return; }
        items.push(item);
      }
    }

    if (!this.checkUseful(scope)) { return; }

    this.schedule.availabilities = items;
    if (!this.schedule.id) { this.schedule.id = new Date().valueOf(); }

    if (this.isCreateScheduleItem) {
      this.store.dispatch(new CreateSchedule(this.schedule, this.storeId));
    } else {
      this.store.dispatch(new UpdateSchedule(this.schedule, this.scheduleId, this.storeId));
    }
  }

  checkTimeAndDays(item): boolean {
    if (item.startTime > item.endTime) {
      this.toastr.error(this.translateSer.instant('admin.store.catalog.error.timeScopeWrong'));
      return false;
    } else if (item.daysOfWeek && item.daysOfWeek.length === 0) {
      this.toastr.error(this.translateSer.instant('admin.store.catalog.error.noDaySelect'));
      return false;
    }

    return true;
  }
  checkUseful(scope): boolean {
    for (const day in scope) {
      if (scope[day].length === 1) { continue; }
      const row = scope[day].sort((a, b) => {
        return a.startTime > b.startTime ? 1 : -1;
      });
      for (let i = 0; i < row.length; i++) {
        if (i < row.length - 1 && row[i].endTime > row[i + 1].startTime) {
          this.toastr.error(this.translateSer.instant('admin.store.catalog.error.overlappingSchedules'));
          return false;
        }
      }
    }

    return true;
  }

  addDaysOfWeek() {
    const item = {
      id: new Date().valueOf(),
      startTime: '',
      endTime: '',
      daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      type: 'DAYS_OF_WEEK',
      form: null
    };
    item.form = this.createForm(item);
    this.scheduleItems.push(item);
  }

  addDates() {
    const item = {
      id: new Date().valueOf(),
      startTime: '',
      endTime: '',
      date: new Date().toLocaleDateString('en-US'),
      type: 'DATE_INCLUSIVE',
      form: null
    };
    item.form = this.createForm(item);
    this.scheduleItems.push(item);
  }

  removeScheduleItem(index) {
    if (this.scheduleItems.length === 1) { return; }
    this.scheduleItems.splice(index, 1);
  }

  deleteSchedule() {
    this.store.dispatch(new DeleteSchedule(this.scheduleId, this.storeId));
  }

  gotoPreviousPage(): void {
    if (this.offerId || this.categoryId) {
      try {
        const backLink = localStorage.getItem('backLink');
        this.router.navigateByUrl(backLink);
      } catch (e) {
        console.log('localstorage disabled, falling back to history state');
        if (window.history.state.backLink) {
          this.router.navigateByUrl(window.history.state.backLink);
        }
      }
    } else {
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules`]);
    }
  }
}

