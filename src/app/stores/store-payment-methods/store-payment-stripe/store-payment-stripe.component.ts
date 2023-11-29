import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { map } from 'rxjs/operators';
import { ConnectStripe, DisconnectStripe, ToggleStripe } from '../+state/payment.actions';

@Component({
  selector: 'app-store-payment-stripe',
  templateUrl: './store-payment-stripe.component.html',
  styleUrls: ['./store-payment-stripe.component.scss']
})
export class StorePaymentStripeComponent implements OnInit {

  creditcardPaymentFlag$: Observable<string>;
  idealPaymentFlag$: Observable<string>;
  bancontactPaymentFlag$: Observable<string>;
  stripeId$: Observable<string>;
  digitalWalletsFlag$: Observable<boolean>;

  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    const settings$ = this.store.pipe(
      select(getSelectedStore),
      map(s => s.settings)
    );

    this.creditcardPaymentFlag$ = settings$.pipe(
      map(s => s.PAYMENT_STRIPE_CREDIT_CARD_ENABLED)
    );

    this.idealPaymentFlag$ = settings$.pipe(
      map(s => s.PAYMENT_STRIPE_IDEAL_ENABLED)
    );

    this.bancontactPaymentFlag$ = settings$.pipe(
      map(s => s.PAYMENT_STRIPE_BANCONTACT_ENABLED)
    );

    this.stripeId$ = settings$.pipe(
      map(s => s.STRIPE_ACCOUNT_ID)
    );

    this.digitalWalletsFlag$ = settings$.pipe(
      map(s => s.PAYMENT_STRIPE_DIGITAL_WALLETS_ENABLED)
    );

  }

  connect() {
    this.store.dispatch(new ConnectStripe());
  }

  disconnect() {
    this.store.dispatch(new DisconnectStripe());
  }

  toggleStripePayments(paymentSettingKey: string, e) {
    this.store.dispatch(new ToggleStripe(paymentSettingKey, e.target.checked as boolean));
  }
}
