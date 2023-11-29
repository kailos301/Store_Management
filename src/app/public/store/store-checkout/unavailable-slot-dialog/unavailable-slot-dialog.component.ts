import { Component, ElementRef, OnInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import dayjs from 'dayjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToggleUnavailableDeliveryTimeError, UpdateOrderWishTime } from '../../+state/stores.actions';
import { getCheckoutState } from '../../+state/stores.selectors';
import { Slot } from '../../types/AvailableSlotsResponse';

@Component({
  selector: 'app-unavailable-slot-dialog',
  templateUrl: './unavailable-slot-dialog.component.html',
  styleUrls: ['./unavailable-slot-dialog.component.scss']
})
export class UnavailableSlotDialogComponent implements OnInit, OnDestroy {

  @ViewChild('unavailableSlotDialog', { static: true }) unavailableSlotDialog: ElementRef;

  unsubscribe$: Subject<void> = new Subject<void>();
  suggestedSlot: Slot;

  constructor(private renderer: Renderer2, private store: Store<any>) { }

  ngOnInit() {
    this.store.select(getCheckoutState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(d => {
        this.suggestedSlot = d.checkoutState.data.slotUnavailableError.suggestedSlot;
        if (d.checkoutState.data.slotUnavailableError.visible) {
          this.openUnavailableSlotDialog();
        } else {
          this.closeUnavailableSlotDialog();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  dismissUnavailableSlotDialog() {
    this.store.dispatch(new ToggleUnavailableDeliveryTimeError(false));
  }

  openUnavailableSlotDialog() {
    this.renderer.removeClass(this.unavailableSlotDialog.nativeElement, 'hide');
  }

  closeUnavailableSlotDialog() {
    this.renderer.addClass(this.unavailableSlotDialog.nativeElement, 'hide');
  }

  updateOrder(evt) {
    evt.preventDefault();
    if (this.suggestedSlot && this.suggestedSlot.startTime) {
      this.store.dispatch(new UpdateOrderWishTime(this.suggestedSlot));
    } else {
      this.store.dispatch(new ToggleUnavailableDeliveryTimeError(false));
    }
  }

  formattedSuggestedTime() {
    let result = dayjs(this.suggestedSlot.startTime).format('HH:mm');
    if (this.suggestedSlot.endTime) {
      result += ' - ' + dayjs(this.suggestedSlot.endTime).format('HH:mm');
    }
    return result;
  }

  formattedSuggestedDate() {
    return (new Date(this.suggestedSlot.startTime)).toLocaleDateString() + ' - ' + dayjs(this.suggestedSlot.startTime).format('dddd');
  }
}
