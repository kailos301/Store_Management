import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../checkout.service';
import { select, Store } from '@ngrx/store';
import { CatalogState } from '../../+state/stores.reducer';
import {
  getCurrentCartStatus,
  getCurrentOrderDeliveryMethod,
  getCurrentOrderWishTime,
  getSelectedStore,
  getSelectedStoreOpeningHours,
  getStoreOpenInDate,
  getStoreOpeningInfo,
  getUserLanguage
} from '../../+state/stores.selectors';
import { Observable, Subject } from 'rxjs';
import { Availability, ClientStore, SpecialSchedule } from 'src/app/stores/stores';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { AddCheckoutState, FetchSlots, SlotSelected } from '../../+state/stores.actions';
import { AvailableSlotsResponse, Slot } from '../../types/AvailableSlotsResponse';
import { DELIVERY_METHODS } from '../../types/DeliveryMethod';
import StoreUtils from '../../utils/StoreUtils';


@Component({
  selector: 'app-store-checkout-order-wish-time-panel',
  templateUrl: './store-checkout-order-wish-time-panel.component.html',
  styleUrls: ['./store-checkout-order-wish-time-panel.component.scss']
})
export class StoreCheckoutOrderWishTimePanelComponent implements OnInit, OnDestroy {

  DAYS_OF_WEEK = [ 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN' ];

  private destroy$ = new Subject();
  selectedStore: ClientStore;
  userLang$: Observable<string>;
  deliveryTime: Slot;
  mstep: any;
  wishForm: FormGroup;

  storeOpeningHours: SpecialSchedule;
  disableOrderNow = true;
  showClosedStoreMessage = false;

  currentWishTime: string = null;

  orderDeliveryMethod: string;
  slots: AvailableSlotsResponse;
  availableSlots: Slot[];

  @Output() scrollToWishComponent = new EventEmitter();
  @ViewChild('wishWrapper') wishWrapper: ElementRef;
  constructor(private store: Store<CatalogState>, private fb: FormBuilder, public checkoutService: CheckoutService) {
  }

  ngOnInit() {

    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(isBetween);

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getSelectedStore),
      filter(s => s != null)
    ).subscribe(store => {
      this.selectedStore = store;
    });

    this.userLang$  = this.store.select(getUserLanguage);
    this.wishForm = this.fb.group({
      wishOrderDeliveryTime: [
        this.checkoutService.getOrderMetaData('wishTime')
        || this.checkoutService.getPickupMethod()
        && !this.shouldShowAsapOrder() ? '1' : '0',
        Validators.compose([Validators.required])
      ],
      deliveryTime: [{}, Validators.compose([Validators.required])],
    });
    this.store.pipe(
      takeUntil(this.destroy$),
      select(getCurrentOrderDeliveryMethod),
    ).subscribe((deliveryMethod) => {
      if (!this.shouldShowFutureOrder()) {
        this.setWishTime(false);
      }
    });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getStoreOpeningInfo)
    ).subscribe(storeOpeningInfo => {
      const slots = storeOpeningInfo.slots;
      if (slots.selectedSlot && slots.selectedSlot.startTime !== '') {
        this.deliveryTime = slots.selectedSlot;
        this.availableSlots = slots.availableSlots;
        this.wishForm.patchValue({deliveryTime: this.deliveryTime});
        // Convert to store timezone before submitting to backend
        this.checkoutService.setOrderMetaState('wishTime', dayjs(this.deliveryTime.startTime).toISOString());
        this.store.dispatch(new AddCheckoutState('timeSelectionValid', true));
      } else {
        this.deliveryTime = {
          startTime: storeOpeningInfo.date,
          endTime: null,
          totalOrders: 0,
          isDisabled: false
        };
        this.availableSlots = [];
        if (this.checkoutService.getOrderMetaData('wishTime')) {
          this.store.dispatch(new AddCheckoutState('timeSelectionValid', false));
        }
      }
    });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getStoreOpenInDate),
      filter((openInDate) => openInDate != null),
    ).subscribe(openInDate => {
      if (!openInDate) {
        this.showClosedStoreMessage = true;
        this.store.dispatch(new AddCheckoutState('timeSelectionValid', false));
      } else {
        this.showClosedStoreMessage = false;
        this.store.dispatch(new AddCheckoutState('timeSelectionValid', true));
      }
    });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getCurrentOrderDeliveryMethod),
      filter(deliveryMethod => deliveryMethod != null),
      withLatestFrom(
        this.store.select(getSelectedStoreOpeningHours),
        this.store.select(getCurrentOrderWishTime),
        this.store.select(getCurrentCartStatus))
    ).subscribe(([orderDeliveryMethod, openingHours, wishTime, cartStatus]) => {
      this.orderDeliveryMethod = orderDeliveryMethod;
      this.storeOpeningHours = openingHours;

      if (this.shouldShowFutureOrder() && cartStatus === 'LOADED') {
        this.store.dispatch(
          new FetchSlots(
            this.selectedStore.id,
            DELIVERY_METHODS[orderDeliveryMethod],
            dayjs(wishTime).format('YYYY-MM-DD')
          )
        );
      }

      if (!openingHours) {
        this.disableOrderNow = false;
        return;
      }

      const storeSchedulesForDay = this.storeAvailabilitiesInDay(this.currentStoreTime.format('ddd').toUpperCase());

      const openNow = storeSchedulesForDay.find(
        s => this.currentStoreTime.isBetween(
          this.storeOpeningTime(dayjs(), s),
          this.storeClosingTime(dayjs(), s),
          'minute', '[]'
        )
      );

      if (!this.shouldShowAsapOrder() && !this.shouldShowFutureOrder()) {
        if (!openNow) {
          this.store.dispatch(new AddCheckoutState('timeSelectionValid', false));
          this.showClosedStoreMessage = true;
          return;
        } else {
          this.store.dispatch(new AddCheckoutState('timeSelectionValid', true));
          this.showClosedStoreMessage = false;
          return;
        }
      }

      if (this.shouldShowFutureOrder()) {

        if (!openNow) {
          this.disableOrderNow = true;

          this.getControl('wishOrderDeliveryTime').setValue('1');

        } else {
          this.disableOrderNow = false;
        }
      } else {
        if (!openNow) {
          this.disableOrderNow = true;
          return;
        } else {
          this.disableOrderNow = false;
        }
      }

    });

    this.store.select(getCurrentOrderWishTime).pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.store.select(getStoreOpeningInfo)),
    ).subscribe(([wishTime, storeOpeningInfo]) => {
      this.currentWishTime = wishTime;
      if (wishTime && storeOpeningInfo.date === null) {
        if (this.shouldShowFutureOrder()) {
          this.store.dispatch(new FetchSlots(this.selectedStore.id, DELIVERY_METHODS[this.orderDeliveryMethod], dayjs(wishTime).format('YYYY-MM-DD')));
        }
      }
    });
  }

  compareSlotsFunction(optionOne: Slot, optionTwo: Slot) {
    return optionOne.startTime === optionTwo.startTime;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  shouldShowComponent(): boolean {
    // If not delivery method selected yet then do not show the component
    if (this.checkoutService.getPickupMethod() === undefined) {
      return false;
    }
    if (!this.shouldShowFutureOrder()) {
      return false;
    }
    // If no options for Asap or Future is shown then by default ASAP is assumed and component should not be shown
    // except for the case where store is currently closed where we show the component to print out an error to the user
    if (!this.shouldShowAsapOrder() && this.showClosedStoreMessage) {
      return true;
    }
    return this.shouldShowAsapOrder() || this.shouldShowFutureOrder();
  }

  /**
   * Show asap order option if it applies
   */
  shouldShowAsapOrder(): boolean {
    // If no order receive option is selected, then do not show the component
    if (this.checkoutService.getPickupMethod() === undefined) {
      return false;
    }

    const result = StoreUtils.isAsapOrderEnabled(this.selectedStore, DELIVERY_METHODS[this.checkoutService.getPickupMethodAsInt()]);
    if (!result && this.wishForm) {
      this.wishForm.patchValue({wishOrderDeliveryTime: '1'});
    }

    return result;

  }

  shouldShowFutureOrder(): boolean {
    // If no order receive option is selected, then do not show the component
    if (this.checkoutService.getPickupMethod() === undefined) {
      return false;
    }

    return StoreUtils.isFutureOrderEnabled(this.selectedStore, DELIVERY_METHODS[this.checkoutService.getPickupMethodAsInt()]);
  }

  /**
   * Return current time in store's timezone
   */
  private get currentStoreTime() {
    return dayjs();
  }

  private storeOpeningTime(date: dayjs.Dayjs, availability: Availability) {
    const openingTime = this.storeAvailabilityStart(availability);
    return date.hour(openingTime.hour).minute(openingTime.minute).second(openingTime.second);
  }

  private storeClosingTime(date: dayjs.Dayjs, availability: Availability) {
    const closingTime = this.storeAvailabilityEnd(availability);
    return date.hour(closingTime.hour).minute(closingTime.minute).second(closingTime.second);
  }

  private storeAvailabilityStart(availability: Availability) {
    const startTime = [...availability.startTime.split(':')];
    return {hour: +startTime[0], minute: +startTime[1], second: +startTime[2]};
  }

  private storeAvailabilityEnd(availability: Availability) {
    const endTime = [...availability.endTime.split(':')];
    return {hour: +endTime[0], minute: +endTime[1], second: +endTime[2]};
  }

  private storeAvailabilitiesInDay(day: string) {
    // If daysOfWeek is null we assume the schedule applies to all days in week
    return this.storeOpeningHours.schedule.availabilities.filter(a => !a.daysOfWeek || a.daysOfWeek.includes(day));
  }

  onDateChanged(date: Slot) {
    this.deliveryTime = date;
    this.store.dispatch(new FetchSlots(this.selectedStore.id, DELIVERY_METHODS[this.orderDeliveryMethod], this.deliveryTime.startTime));
  }

  onSelectedSlotChanged(selectedSlot: Slot) {
    this.deliveryTime = selectedSlot;
    if (!this.deliveryTime.startTime) {return; }
    this.checkoutService.setOrderMetaState('wishTime', dayjs(this.deliveryTime.startTime).toISOString());
    this.store.dispatch(new SlotSelected(selectedSlot));
    this.scrollToWishComponent.emit('');
  }

  setWishTime(enableWishTime: boolean) {
    if (enableWishTime) {
      if (!this.currentWishTime) {
        this.store.dispatch(new FetchSlots(this.selectedStore.id, DELIVERY_METHODS[this.orderDeliveryMethod]));
      }
      this.scrollToWishComponent.emit('');
    } else {
      this.checkoutService.setOrderMetaState('wishTime', null);
      this.store.dispatch(new AddCheckoutState('timeSelectionValid', true));
    }
  }

  getControl(name: string) {
    if (this.wishForm) {
      return this.wishForm.get(name);
    }
    return null;
  }

}
