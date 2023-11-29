import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToggleOffersOutOfStock, UpdateOrderItemQuantities } from '../../+state/stores.actions';
import { getCheckoutState } from '../../+state/stores.selectors';
import { OutOfStockOffer } from '../../types/OutOfStockOffer';

@Component({
  selector: 'app-offer-outofstock-dialog',
  templateUrl: './offer-outofstock-dialog.component.html',
  styleUrls: ['./offer-outofstock-dialog.component.scss']
})
export class OfferOutofstockDialogComponent implements OnInit, OnDestroy {

  @ViewChild('offersDialog', { static: true }) offersDialog: ElementRef;

  unsubscribe$: Subject<void> = new Subject<void>();
  outOfStockOffers: OutOfStockOffer[];

  constructor(private renderer: Renderer2, private store: Store<any>) { }

  ngOnInit() {
    this.store.select(getCheckoutState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(d => {
        this.outOfStockOffers = d.checkoutState.data.offerOutOfStockErrors.offers;
        if (d.checkoutState.data.offerOutOfStockErrors.visible) {
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
    this.store.dispatch(new ToggleOffersOutOfStock(false));
  }

  openOffersDialog() {
    this.renderer.removeClass(this.offersDialog.nativeElement, 'hide');
  }

  private closeOffersDialog() {
    this.renderer.addClass(this.offersDialog.nativeElement, 'hide');
  }

}
