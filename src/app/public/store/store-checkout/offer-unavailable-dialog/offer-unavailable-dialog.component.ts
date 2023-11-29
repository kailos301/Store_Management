import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToggleOffersUnavailable, UpdateOrderItemQuantities } from '../../+state/stores.actions';
import { getCheckoutState } from '../../+state/stores.selectors';
import { UnavailableOffer } from '../../types/UnavailableOffer';

@Component({
  selector: 'app-offer-unavailable-dialog',
  templateUrl: './offer-unavailable-dialog.component.html',
  styleUrls: ['./offer-unavailable-dialog.component.scss']
})
export class OfferUnavailableDialogComponent implements OnInit, OnDestroy {

  @ViewChild('offersDialog', { static: true }) offersDialog: ElementRef;

  unsubscribe$: Subject<void> = new Subject<void>();
  unavailableOffers: UnavailableOffer;

  constructor(private renderer: Renderer2, private store: Store<any>) { }

  ngOnInit() {
    this.store.select(getCheckoutState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(d => {
        this.unavailableOffers = d.checkoutState.data.offerAvailabilityErrors.offers;
        if (d.checkoutState.data.offerAvailabilityErrors.visible) {
          this.openOffersDialog();
        } else {
          this.closeOffersDialog();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  dismissOffersDialog() {
    this.store.dispatch(new ToggleOffersUnavailable(false));
  }

  openOffersDialog() {
    this.renderer.removeClass(this.offersDialog.nativeElement, 'hide');
  }

  closeOffersDialog() {
    this.renderer.addClass(this.offersDialog.nativeElement, 'hide');
  }

  updateOrder(evt) {
    evt.preventDefault();
    this.store.dispatch(new UpdateOrderItemQuantities(this.unavailableOffers.orderItemUuids.map(o => {
        return {uuid: o, quantity: 0};
     })));
  }

}
