import { ConnectPaypal, DisconnectPaypal, TogglePaypal } from './../+state/payment.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../../+state/stores.reducer';
import { Observable, Subject } from 'rxjs';
import { getSelectedStore } from '../../+state/stores.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { UpdateStoreSettings } from '../../+state/stores.actions';

@Component({
  selector: 'app-store-payment-paypal',
  templateUrl: './store-payment-paypal.component.html',
  styleUrls: ['./store-payment-paypal.component.scss']
})
export class StorePaymentPaypalComponent implements OnInit, OnDestroy {

  paypalForm: FormGroup;
  paymentFlag: any;
  paypalId: any;
  unsubscribe$: Subject<void> = new Subject<void>();
  paypalMessage: string;
  http: any;
  https: any;
  payPalme: any;

  constructor(private store: Store<StoresState>, private fb: FormBuilder, private route: ActivatedRoute) {
    this.http = 'http://';
    this.https = 'https://';
    this.payPalme = 'https://paypal.me/';
  }

  ngOnInit() {
    this.paypalForm = this.fb.group({
      POST_ORDER_PAYMENT_LINK_PAYPALME_URL: [this.payPalme, Validators.compose([Validators.maxLength(200)])],
      POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION: ['', Validators.compose([Validators.maxLength(100)])],
      POST_ORDER_PAYMENT_LINK_GENERAL_URL: [this.https, Validators.compose([Validators.maxLength(200)])],
      POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED: [''],
      POST_ORDER_PAYMENT_LINK_GENERAL_ENABLED: ['']
    });
    this.store.select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(s => {
        this.paypalForm.patchValue(s.settings);
        this.paymentFlag = s.settings.PAYMENT_PAYPAL_ENABLED;
        this.paypalId = s.settings.PAYPAL_MERCHANT_ID;
      });

    this.paypalForm.get('POST_ORDER_PAYMENT_LINK_GENERAL_URL').valueChanges.subscribe(v => {
      if (this.paypalForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_URL.value !== this.https &&
        this.paypalForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION.value.length === 0) {
        this.paypalForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION.setErrors({ required: true });
      } else {
        this.paypalForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION.setErrors(null);
      }
    });

  }


  togglePaypalPayments(e) {
    this.store.dispatch(new TogglePaypal(e.target.checked as boolean));
  }

  checkPredefault(input, isPaypal) {
    const field = input.target;
    if (isPaypal) {
      this.togglePaypalMe(input.target.value);
      if (field.value.indexOf(this.payPalme) === -1 &&
        field.value.indexOf(this.payPalme) === -1) {
        input.target.value = this.payPalme;
        this.togglePaypalMe(input.target.value);
      }
    } else {
      if (field.value.indexOf(this.http) === -1 &&
        field.value.indexOf(this.https) === -1) {
        input.target.value = this.https;
      }
    }
  }

  togglePaypalMe(inputText) {
    if (inputText.length > this.payPalme.length) {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(true);
    } else {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(false);
    }
  }

  togglePaypalMeSwitch(input) {
    if (this.paypalForm.controls.POST_ORDER_PAYMENT_LINK_PAYPALME_URL.value.length <= this.payPalme.length) {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(false);
    } else {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(input.target.checked);
      this.onFocusOut();
    }
  }

  checkPredefaultPaymentLink(input, isPaypal) {
    const field = input.target;
    if (isPaypal) {
      this.togglePaymentLink(input.target.value);
      if (field.value.indexOf(this.payPalme) === -1 &&
        field.value.indexOf(this.payPalme) === -1) {
        input.target.value = this.payPalme;
        this.togglePaymentLink(input.target.value);
      }
    } else {
      if (field.value.indexOf(this.http) === -1 &&
        field.value.indexOf(this.https) === -1) {
        input.target.value = this.https;
        this.onFocusOut();
      }
    }
  }

  togglePaymentLink(inputText) {
    if (inputText !== (this.payPalme)) {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(true);
      this.onFocusOut();
    } else {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_PAYPALME_ENABLED').setValue(false);
      this.onFocusOut();
    }
  }

  togglePaymentLinkSwitch(input) {
    if (this.paypalForm.controls.POST_ORDER_PAYMENT_LINK_GENERAL_DESCRIPTION.value !== (this.payPalme) && input.target.checked) {
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_GENERAL_ENABLED').setValue(true);
      this.onFocusOut();
    } else {
      input.target.checked = false;
      this.paypalForm.get('POST_ORDER_PAYMENT_LINK_GENERAL_ENABLED').setValue(false);
      this.onFocusOut();
    }
  }

  getControl(name: string) {
    return this.paypalForm.get(name);
  }

  connect() {
    this.store.dispatch(new ConnectPaypal());
  }

  disconnect() {
    this.store.dispatch(new DisconnectPaypal());
  }

  onFocusOut() {
    if (this.paypalForm.valid) {
      const formData = this.paypalForm.getRawValue();
      if (formData.POST_ORDER_PAYMENT_LINK_PAYPALME_URL.length < this.payPalme.length) {
        formData.POST_ORDER_PAYMENT_LINK_PAYPALME_URL = this.payPalme;
      }
      this.store.dispatch(new UpdateStoreSettings(formData));
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
