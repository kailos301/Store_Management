import { getSubscriptionPurchase, getStatus, getValidations } from './../+state/store-subscriptions.selectors';
import { StorePurchase } from './../subscriptions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { UpdateSubscriptionPurchase, CheckoutSubscription } from '../+state/store-subscriptions.actions';
import { map, filter, debounceTime, takeUntil, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getSelectedStore } from '../../+state/stores.selectors';
import { ClientStore } from '../../stores';
import { helpPage } from 'src/app/shared/help-page.const';

@Component({
  selector: 'app-subscription-purchase',
  templateUrl: './subscription-purchase.component.html',
  styleUrls: ['./subscription-purchase.component.scss']
})
export class SubscriptionPurchaseComponent implements OnInit, OnDestroy {

  readonly NETHERLANDS = 'NL';
  readonly BELGIUM = 'BE';

  selectedStore$: Observable<ClientStore>;

  subscriptionPurchase$: Observable<StorePurchase>;

  checkoutEnabled$: Observable<boolean>;

  vatInfo$: Observable<{percentage: number; vatCharge: number}>;

  subscriptionPurchaseForm: FormGroup;

  private destroy$ = new Subject();

  subscriptionPurchaseHelpPage = helpPage.subscription;

  storeSubscriptionErrors$: Observable<any>;
  inValidVat: boolean;
  inValidVoucher: boolean;
  reservedVoucher: boolean;

  constructor(private store: Store<any>, private fb: FormBuilder) { }

  ngOnInit() {

    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );

    this.subscriptionPurchase$ = this.store.pipe(
      select(getSubscriptionPurchase)
    );

    this.checkoutEnabled$ = this.store.pipe(
      select(getStatus),
      map(s => s === 'LOADED')
    );

    this.subscriptionPurchaseForm = this.fb.group({
      vatNumber: ['',  Validators.compose([Validators.minLength(5), Validators.maxLength(20)])],
      voucherCode: ['',
        Validators.compose(
          [Validators.minLength(1), Validators.maxLength(16), Validators.pattern('^[a-zA-Z0-9]{4}(-)?[a-zA-Z0-9]{4}$')]
        )],
      paymentMethod: ['', Validators.required]
    });
    this.selectedStore$.pipe(
      filter(p => p.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(p => {
      this.subscriptionPurchaseForm.patchValue({
        vatNumber: p.vatNumber,
      }, {emitEvent: false});
    });
    this.subscriptionPurchase$.pipe(
      filter(p => p.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(p => {
      this.subscriptionPurchaseForm.patchValue({
        voucherCode: p.voucherCode
      }, {emitEvent: false});
    });

    this.selectedStore$.pipe(
      filter(s => s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      let paymentMethod = 'STRIPE';
      if (s.address.country.code === this.NETHERLANDS) {
        paymentMethod = 'IDEAL';
      }
      if (s.address.country.code === this.BELGIUM) {
        paymentMethod = 'BANCONTACT';
      }

      this.subscriptionPurchaseForm.patchValue({
        paymentMethod
      }, {emitEvent: false});
    });



    this.subscriptionPurchaseForm.get('vatNumber').valueChanges.pipe(
      debounceTime(500),
      filter(_ => this.subscriptionPurchaseForm.get('vatNumber').valid),
      takeUntil(this.destroy$)
    ).subscribe(
      val => this.store.dispatch(new UpdateSubscriptionPurchase(
        {voucherCode: this.getControl('voucherCode').value, vatNumber: val, status: 'DRAFT'}))
    );

    this.subscriptionPurchaseForm.get('voucherCode').valueChanges.pipe(
      debounceTime(500),
      filter(_ => this.subscriptionPurchaseForm.get('voucherCode').valid),
      takeUntil(this.destroy$)
    ).subscribe(
      val => this.store.dispatch(new UpdateSubscriptionPurchase(
        {voucherCode: val, vatNumber: this.getControl('vatNumber').value, status: 'DRAFT'}))
    );

    this.vatInfo$ = this.subscriptionPurchase$.pipe(
      filter(s => s.id > 0),
      map(s => {
        if (s.vatChargeType === 'REVERSE_CHARGE') {
          return {percentage: 0, vatCharge: 0};
        } else {
          return {percentage: s.vatPercentage, vatCharge: s.vatCharge};
        }
      })
    );

    this.storeSubscriptionErrors$ = this.store.pipe(select(getValidations));
    this.storeSubscriptionErrors$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(
     message => {
        if (!!message && Array.isArray(message) && [...message].includes('No voucher present with the code.')) {
          this.inValidVoucher = true;
        } else if (!!message && !!message.voucherCode) {
          this.inValidVoucher = false;
        } else {
          this.inValidVoucher = null;
        }
        if (!!message && Array.isArray(message) && [...message].includes('Invalid VAT number')) {
          this.inValidVat = true;
        } else if (!!message && !!message.vatNumber) {
          this.inValidVat = false;
        } else {
          this.inValidVat = null;
        }
        if (!!message && Array.isArray(message) && [...message].includes('The voucher is reserved by some other purchase.')) {
          this.reservedVoucher = true;
        } else if (!!message && !!message.voucherCode) {
          this.reservedVoucher = false;
        } else {
          this.reservedVoucher = null;
        }
    });
    this.subscriptionPurchaseForm.get('voucherCode').valueChanges.subscribe(v => {
      this.inValidVoucher = null;
      this.reservedVoucher = null;
    });
    this.subscriptionPurchaseForm.get('vatNumber').valueChanges.subscribe(v => {
      this.inValidVat = null;
    });
  }

  onContinue() {
    this.store.dispatch(new CheckoutSubscription(this.getControl('paymentMethod').value));
  }

  getControl(name: string) {
    return this.subscriptionPurchaseForm.get(name);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
