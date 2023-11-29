import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { getSelectedStore } from '../../+state/stores.selectors';
import {
  getAddressDeliverySchedule,
  getAllSchedules,
  getOpeningSchedule,
  getPickupSchedule,
  getServingSchedule
} from '../+state/stores-schedule.selectors';
import {
  CreateSpecialSchedule,
  UpdateSpecialSchedule,
  DeleteSpecialSchedule,
} from '../+state/stores-schedule.actions';
import { Schedule } from '../stores-schedule';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { DateAdapter } from '@angular/material/core';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Component({
  selector: 'app-store-schedules',
  templateUrl: './store-schedules.component.html',
  styleUrls: ['./store-schedules.component.scss']
})
export class StoreSchedulesComponent implements OnInit, OnDestroy {

  schedules$: Observable<Schedule[]>;
  storeId: number;
  openingTimeScheduleId: number;
  addressDeliveryScheduleId: number;
  pickupScheduleId: number;
  servingScheduleId: number;
  openingTimeSpecialScheduleId: number;
  addressDeliveryTimeSpecialScheduleId: number;
  pickupTimeSpecialScheduleId: number;
  servingSpecialScheduleId: number;
  private destroy$ = new Subject();
  settingsForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<any>
  ) {}

  ngOnInit() {
    this.storeId = this.route.snapshot.parent.parent.params.id;
    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ). subscribe(loggedInUser => {
      if (loggedInUser && loggedInUser.preferredLanguage && loggedInUser.preferredLanguage.locale) {
        const locale = loggedInUser.preferredLanguage.locale;
        this.dateAdapter.setLocale(locale);
      }
    });
    this.schedules$ = this.store.pipe(
      select(getAllSchedules)
    );
    this.store.pipe(takeUntil(this.destroy$), select(getOpeningSchedule)).subscribe(s => {
      if (s.status === 'LOADED' && s.data[0]) {
        this.openingTimeScheduleId = s.data[0].schedule.id;
        this.openingTimeSpecialScheduleId = s.data[0].id;
      } else {
        this.openingTimeScheduleId = 0;
        this.openingTimeSpecialScheduleId = undefined;
      }
    });
    this.store.pipe(takeUntil(this.destroy$), select(getAddressDeliverySchedule)).subscribe(s => {
      if (s.status === 'LOADED' && s.data[0]) {
        this.addressDeliveryScheduleId = s.data[0].schedule.id;
        this.addressDeliveryTimeSpecialScheduleId = s.data[0].id;
      } else {
        this.addressDeliveryScheduleId = 0;
        this.addressDeliveryTimeSpecialScheduleId = undefined;
      }
    });
    this.store.pipe(takeUntil(this.destroy$), select(getPickupSchedule)).subscribe(s => {
      if (s.status === 'LOADED' && s.data[0]) {
        this.pickupScheduleId = s.data[0].schedule.id;
        this.pickupTimeSpecialScheduleId = s.data[0].id;
      } else {
        this.pickupScheduleId = 0;
        this.pickupTimeSpecialScheduleId = undefined;
      }
    });
    this.store.pipe(takeUntil(this.destroy$), select(getServingSchedule)).subscribe(s => {
      if (s.status === 'LOADED' && s.data[0]) {
        this.servingScheduleId = s.data[0].schedule.id;
        this.servingSpecialScheduleId = s.data[0].id;
      } else {
        this.servingScheduleId = 0;
        this.servingSpecialScheduleId = undefined;
      }
    });
    this.settingsForm = this.fb.group({
      DELIVERY_IN_STORE_LOCATION_CHOOSE_ASAP_ORDER_DATE: [''],
      DELIVERY_IN_STORE_LOCATION_CHOOSE_FUTURE_ORDER_DATE: [''],
      DELIVERY_IN_STORE_LOCATION_DISABLE_SAME_DAY_ORDERING: [''],
      DELIVERY_NO_LOCATION_CHOOSE_ASAP_ORDER_DATE: [''],
      DELIVERY_NO_LOCATION_CHOOSE_FUTURE_ORDER_DATE: [''],
      DELIVERY_NO_LOCATION_DISABLE_SAME_DAY_ORDERING: [''],
      DELIVERY_ADDRESS_CHOOSE_ASAP_ORDER_DATE: [''],
      DELIVERY_ADDRESS_CHOOSE_FUTURE_ORDER_DATE: [''],
      DELIVERY_REQUEST_ORDER_DATE_UPFRONT: [''],
      DELIVERY_ADDRESS_DISABLE_SAME_DAY_ORDERING: [''],
      DELIVERY_IN_STORE_LOCATION_WISH_TIME_INTERVAL: ['', Validators.pattern('^[1-9]\d*$')],
      MAX_ITEMS_PER_SLOT: ['', Validators.pattern('^[1-9]\d*$')],
      DELIVERY_NO_LOCATION_WISH_TIME_INTERVAL: [''],
      DELIVERY_ADDRESS_WISH_TIME_INTERVAL: [''],
      DELIVERY_IN_STORE_LOCATION_ENABLE_SLOT_DURATION: [''],
      DELIVERY_NO_LOCATION_ENABLE_SLOT_DURATION: [''],
      DELIVERY_ADDRESS_ENABLE_SLOT_DURATION: [''],
      DELIVERY_IN_STORE_LOCATION_SLOT_DURATION: [''],
      DELIVERY_NO_LOCATION_SLOT_DURATION: [''],
      DELIVERY_ADDRESS_SLOT_DURATION: [''],
      DELIVERY_IN_STORE_LOCATION_LIMIT_ORDER_PER_SLOT: [''],
      DELIVERY_NO_LOCATION_LIMIT_ORDER_PER_SLOT: [''],
      DELIVERY_ADDRESS_LIMIT_ORDER_PER_SLOT: [''],
      DELIVERY_IN_STORE_LOCATION_ORDER_PER_SLOT: [''],
      DELIVERY_NO_LOCATION_ORDER_PER_SLOT: [''],
      DELIVERY_ADDRESS_ORDER_PER_SLOT: [''],
      DELIVERY_IN_STORE_LOCATION_MINIMUM_WISH_TIME_FUTURE: [''],
      DELIVERY_NO_LOCATION_MINIMUM_WISH_TIME_FUTURE: [''],
      DELIVERY_ADDRESS_MINIMUM_WISH_TIME_FUTURE: [''],
      DEFAULT_DELIVERY_MODE: [''],
      DELIVERY_IN_STORE_LOCATION_HIDE_FUTURE_WISH_DATE: [''],
      DELIVERY_NO_LOCATION_HIDE_FUTURE_WISH_DATE: [''],
      DELIVERY_ADDRESS_HIDE_FUTURE_WISH_DATE: ['']
    });
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.settings) {
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_HIDE_FUTURE_WISH_DATE')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_HIDE_FUTURE_WISH_DATE);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_HIDE_FUTURE_WISH_DATE')
          .setValue(s.settings.DELIVERY_NO_LOCATION_HIDE_FUTURE_WISH_DATE);
        this.settingsForm
          .get('DELIVERY_ADDRESS_HIDE_FUTURE_WISH_DATE')
          .setValue(s.settings.DELIVERY_ADDRESS_HIDE_FUTURE_WISH_DATE);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_CHOOSE_ASAP_ORDER_DATE')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_CHOOSE_ASAP_ORDER_DATE);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_CHOOSE_FUTURE_ORDER_DATE')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_CHOOSE_FUTURE_ORDER_DATE);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_DISABLE_SAME_DAY_ORDERING')
          .setValue(!s.settings.DELIVERY_IN_STORE_LOCATION_DISABLE_SAME_DAY_ORDERING);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_CHOOSE_ASAP_ORDER_DATE')
          .setValue(s.settings.DELIVERY_NO_LOCATION_CHOOSE_ASAP_ORDER_DATE);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_CHOOSE_FUTURE_ORDER_DATE')
          .setValue(s.settings.DELIVERY_NO_LOCATION_CHOOSE_FUTURE_ORDER_DATE);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_DISABLE_SAME_DAY_ORDERING')
          .setValue(!s.settings.DELIVERY_NO_LOCATION_DISABLE_SAME_DAY_ORDERING);
        this.settingsForm
          .get('DELIVERY_ADDRESS_CHOOSE_ASAP_ORDER_DATE')
          .setValue(s.settings.DELIVERY_ADDRESS_CHOOSE_ASAP_ORDER_DATE);
        this.settingsForm
          .get('DELIVERY_ADDRESS_CHOOSE_FUTURE_ORDER_DATE')
          .setValue(s.settings.DELIVERY_ADDRESS_CHOOSE_FUTURE_ORDER_DATE);
        this.settingsForm
          .get('DELIVERY_ADDRESS_DISABLE_SAME_DAY_ORDERING')
          .setValue(!s.settings.DELIVERY_ADDRESS_DISABLE_SAME_DAY_ORDERING);
        this.settingsForm
          .get('DELIVERY_REQUEST_ORDER_DATE_UPFRONT')
          .setValue(s.settings.DELIVERY_REQUEST_ORDER_DATE_UPFRONT);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_WISH_TIME_INTERVAL')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_WISH_TIME_INTERVAL);
        this.settingsForm
          .get('MAX_ITEMS_PER_SLOT')
          .setValue(s.settings.MAX_ITEMS_PER_SLOT);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_WISH_TIME_INTERVAL')
          .setValue(s.settings.DELIVERY_NO_LOCATION_WISH_TIME_INTERVAL);
        this.settingsForm
          .get('DELIVERY_ADDRESS_WISH_TIME_INTERVAL')
          .setValue(s.settings.DELIVERY_ADDRESS_WISH_TIME_INTERVAL);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_ENABLE_SLOT_DURATION')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_ENABLE_SLOT_DURATION);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_ENABLE_SLOT_DURATION')
          .setValue(s.settings.DELIVERY_NO_LOCATION_ENABLE_SLOT_DURATION);
        this.settingsForm
          .get('DELIVERY_ADDRESS_ENABLE_SLOT_DURATION')
          .setValue(s.settings.DELIVERY_ADDRESS_ENABLE_SLOT_DURATION);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_SLOT_DURATION')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_SLOT_DURATION);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_SLOT_DURATION')
          .setValue(s.settings.DELIVERY_NO_LOCATION_SLOT_DURATION);
        this.settingsForm
          .get('DELIVERY_ADDRESS_SLOT_DURATION')
          .setValue(s.settings.DELIVERY_ADDRESS_SLOT_DURATION);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_LIMIT_ORDER_PER_SLOT')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_LIMIT_ORDER_PER_SLOT);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_LIMIT_ORDER_PER_SLOT')
          .setValue(s.settings.DELIVERY_NO_LOCATION_LIMIT_ORDER_PER_SLOT);
        this.settingsForm
          .get('DELIVERY_ADDRESS_LIMIT_ORDER_PER_SLOT')
          .setValue(s.settings.DELIVERY_ADDRESS_LIMIT_ORDER_PER_SLOT);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_ORDER_PER_SLOT')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_ORDER_PER_SLOT);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_ORDER_PER_SLOT')
          .setValue(s.settings.DELIVERY_NO_LOCATION_ORDER_PER_SLOT);
        this.settingsForm
          .get('DELIVERY_ADDRESS_ORDER_PER_SLOT')
          .setValue(s.settings.DELIVERY_ADDRESS_ORDER_PER_SLOT);
        this.settingsForm
          .get('DELIVERY_IN_STORE_LOCATION_MINIMUM_WISH_TIME_FUTURE')
          .setValue(s.settings.DELIVERY_IN_STORE_LOCATION_MINIMUM_WISH_TIME_FUTURE);
        this.settingsForm
          .get('DELIVERY_NO_LOCATION_MINIMUM_WISH_TIME_FUTURE')
          .setValue(s.settings.DELIVERY_NO_LOCATION_MINIMUM_WISH_TIME_FUTURE);
        this.settingsForm
          .get('DELIVERY_ADDRESS_MINIMUM_WISH_TIME_FUTURE')
          .setValue(s.settings.DELIVERY_ADDRESS_MINIMUM_WISH_TIME_FUTURE);
        this.settingsForm
          .get('DEFAULT_DELIVERY_MODE')
          .setValue(s.settings.DEFAULT_DELIVERY_MODE);
      }
    });
  }
  updateSpecialSchedule(event, type, typeId) {
    const selectedId = event.target.value;

    if (selectedId !== '0') {
      if (typeId) {
        this.store.dispatch(new UpdateSpecialSchedule(typeId, type, selectedId, this.storeId));
      } else {
        this.store.dispatch(new CreateSpecialSchedule(type, selectedId, this.storeId));
      }
    } else {
      this.store.dispatch(new DeleteSpecialSchedule(type, typeId, this.storeId));
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSetting() {
    const formObj = this.settingsForm
      .getRawValue();
    formObj.DELIVERY_IN_STORE_LOCATION_DISABLE_SAME_DAY_ORDERING
     = !formObj.DELIVERY_IN_STORE_LOCATION_DISABLE_SAME_DAY_ORDERING;
    formObj.DELIVERY_NO_LOCATION_DISABLE_SAME_DAY_ORDERING = !formObj.DELIVERY_NO_LOCATION_DISABLE_SAME_DAY_ORDERING;
    formObj.DELIVERY_ADDRESS_DISABLE_SAME_DAY_ORDERING = !formObj.DELIVERY_ADDRESS_DISABLE_SAME_DAY_ORDERING;
    formObj.DELIVERY_IN_STORE_LOCATION_MINIMUM_WISH_TIME_FUTURE =
      formObj.DELIVERY_IN_STORE_LOCATION_MINIMUM_WISH_TIME_FUTURE === 0
        ? null
        : formObj.DELIVERY_IN_STORE_LOCATION_MINIMUM_WISH_TIME_FUTURE;
    formObj.DELIVERY_NO_LOCATION_MINIMUM_WISH_TIME_FUTURE =
      formObj.DELIVERY_NO_LOCATION_MINIMUM_WISH_TIME_FUTURE === 0
        ? null
        : formObj.DELIVERY_NO_LOCATION_MINIMUM_WISH_TIME_FUTURE;
    formObj.DELIVERY_ADDRESS_MINIMUM_WISH_TIME_FUTURE =
      formObj.DELIVERY_ADDRESS_MINIMUM_WISH_TIME_FUTURE === 0
        ? null
        : formObj.DELIVERY_ADDRESS_MINIMUM_WISH_TIME_FUTURE;
    this.store.dispatch(new UpdateStoreSettings(formObj));
  }
}
