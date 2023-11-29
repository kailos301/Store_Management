import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

import { Observable, Subject } from 'rxjs';
import { Slot } from '../../types/AvailableSlotsResponse';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Store } from '@ngrx/store';
import { CatalogState } from '../../+state/stores.reducer';
import { UpdateOrderWish } from '../../+state/stores.actions';
import { getOrderWish } from '../../+state/stores.selectors';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-store-checkout-order-time-selector',
  templateUrl: './store-checkout-order-time-selector.component.html',
  styleUrls: ['./store-checkout-order-time-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreCheckoutOrderTimeSelectorComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userLang$: Observable<string>;
  @Input() deliveryTime: Slot;
  @Input() showSlotSelection: boolean;
  @Input() availableSlots: Slot[];
  @Input() timeShowEnabled: boolean;

  @Output() dateChanged = new EventEmitter<Slot>();
  @Output() selectedSlotChanged = new EventEmitter<Slot>();

  private destroy$ = new Subject();
  browserTimeZone: string;
  currentTime: Dayjs;
  selectedSlot: Slot;
  wish$: Observable<Date>;
  ulang: string;

  constructor(private store: Store<CatalogState>) { }

  ngOnInit() {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(isBetween);

    this.browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.currentTime    = dayjs();
    this.selectedSlot = this.deliveryTime;
    this.slotSelected();

    this.wish$ = this.store.select(getOrderWish);
    // this.wish$.pipe(
    //   takeUntil(this.destroy$),
    //   filter(wish => wish !== undefined && wish !== null)
    //   ).subscribe(wish => {
    //     const newSlot = {...this.deliveryTime};
    //     newSlot.startTime = dayjs(wish).format('YYYY-MM-DD');
    //     this.dateChanged.emit(newSlot);
    // });
    this.userLang$.subscribe(ulang => {
      this.ulang = ulang;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.selectedSlot = this.deliveryTime;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  compareSlotsFunction(optionOne: Slot, optionTwo: Slot) {
    if (!optionOne || !optionTwo) {
      return false;
    }
    return optionOne.startTime === optionTwo.startTime;
  }

  reduceDayDisabled() {
    if (!this.currentTime) {
      return true;
    }
    if (
      this.deliveryTime &&
      dayjs(this.deliveryTime.startTime).startOf('day').subtract(1, 'day').isBefore(this.currentTime.startOf('day'))
    ) {
      return true;
    }
    return false;
  }

  reduceDay() {
    if (this.reduceDayDisabled()) {
      return false;
    }
    const newSlot = {...this.deliveryTime};
    newSlot.startTime = dayjs(this.deliveryTime.startTime).subtract(1, 'day').format('YYYY-MM-DD');
    this.store.dispatch(new UpdateOrderWish(new Date(newSlot.startTime)));
    this.dateChanged.emit(newSlot);
  }

  increaseDay() {
    const newSlot = {...this.deliveryTime};
    newSlot.startTime = dayjs(this.deliveryTime.startTime).add(1, 'day').format('YYYY-MM-DD');
    this.store.dispatch(new UpdateOrderWish(new Date(newSlot.startTime)));
    this.dateChanged.emit(newSlot);
  }

  slotSelected() {
    this.selectedSlotChanged.emit(this.selectedSlot);
  }

  onDatePickerChanged(event: MatDatepickerInputEvent<Date>) {
    const newSlot = {...this.deliveryTime};
    newSlot.startTime = dayjs(event.value).format('YYYY-MM-DD');
    this.store.dispatch(new UpdateOrderWish(new Date(newSlot.startTime)));
    this.dateChanged.emit(newSlot);
  }
}
