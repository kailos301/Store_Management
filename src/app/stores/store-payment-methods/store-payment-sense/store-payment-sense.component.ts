import { getSelectedStore } from './../../+state/stores.selectors';
import { UpdateStoreSettings } from './../../+state/stores.actions';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { StoresState } from './../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConnectPaymentsense } from '../+state/payment.actions';

@Component({
    selector: 'app-store-payment-sense',
    templateUrl: './store-payment-sense.component.html',
    styleUrls: ['./store-payment-sense.component.scss']
})
export class StorePaymentsenseComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();
  public showFields: boolean;
  paymentSenseForm: FormGroup;
  paymentSenseEnabled: boolean;
  paymentSenseConnected: boolean;
  paymentSenseUsername: boolean;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.paymentSenseForm = this.fb.group({
      PAYMENTSENSE_GATEWAY_USERNAME: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      PAYMENTSENSE_GATEWAY_PASSWORD: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      PAYMENTSENSE_JWT_TOKEN: ['', Validators.compose([Validators.required, Validators.maxLength(10000)])]
    },
    { validator: this.requiredFieldsValidator() });

    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.settings.PAYMENTSENSE_GATEWAY_USERNAME && s.settings.PAYMENTSENSE_GATEWAY_PASSWORD && s.settings.PAYMENTSENSE_JWT_TOKEN) {
        this.paymentSenseForm.patchValue(s.settings, {emitEvent: false});
        this.paymentSenseConnected = true;
        this.paymentSenseEnabled = s.settings.PAYMENT_PAYMENTSENSE_CREDIT_CARD_ENABLED;
        this.paymentSenseUsername = s.settings.PAYMENTSENSE_GATEWAY_USERNAME;
      } else{
        this.paymentSenseConnected = false;
        this.paymentSenseUsername = false;
        this.paymentSenseEnabled = false;
      }
    });
    this.paymentSenseForm.valueChanges.subscribe(v => {
      if (!v.PAYMENTSENSE_GATEWAY_USERNAME.trim() &&
          !v.PAYMENTSENSE_GATEWAY_PASSWORD.trim() &&
          !v.PAYMENTSENSE_JWT_TOKEN.trim() &&
          !this.paymentSenseConnected
          ) {
          this.paymentSenseEnabled = false;
          this.togglePaymentsensePayments(false);
      }
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPaymentSenseClicked() {
    this.showFields = true;
  }

  getControl(name: string) {
    return this.paymentSenseForm.get(name);
  }

  togglePaymentsensePayments(e) {
    // Do not enable paymentSense payments if no access token and application id defined
    if (this.paymentSenseUsername) {
      this.store.dispatch(new UpdateStoreSettings({PAYMENT_PAYMENTSENSE_CREDIT_CARD_ENABLED: e}));
    }
  }

  connect() {
    this.paymentSenseForm.markAllAsTouched();
    const formData = this.paymentSenseForm.getRawValue();
    if (
      this.paymentSenseForm.valid &&
      formData.PAYMENTSENSE_GATEWAY_PASSWORD.trim() &&
      formData.PAYMENTSENSE_GATEWAY_USERNAME.trim() &&
      formData.PAYMENTSENSE_JWT_TOKEN.trim()
    ) {
      this.store.dispatch(new ConnectPaymentsense({
        username: formData.PAYMENTSENSE_GATEWAY_USERNAME,
        password: formData.PAYMENTSENSE_GATEWAY_PASSWORD,
        jwt: formData.PAYMENTSENSE_JWT_TOKEN,
      }));
    }
  }

  disconnect() {
    this.store.dispatch(new UpdateStoreSettings({
      PAYMENT_PAYMENTSENSE_CREDIT_CARD_ENABLED: false,
      PAYMENTSENSE_GATEWAY_USERNAME: '',
      PAYMENTSENSE_GATEWAY_PASSWORD: '',
      PAYMENTSENSE_JWT_TOKEN: '',
    }));
  }

  requiredFieldsValidator(): ValidatorFn {

    return (control: AbstractControl): {[key: string]: any} | null => {
      const paymentSenseUsername = control.get('PAYMENTSENSE_GATEWAY_USERNAME').value.trim();
      const password = control.get('PAYMENTSENSE_GATEWAY_PASSWORD').value.trim();
      const jwtToken = control.get('PAYMENTSENSE_JWT_TOKEN').value.trim();

      control.get('PAYMENTSENSE_GATEWAY_USERNAME').setErrors( {required: null} );
      control.get('PAYMENTSENSE_GATEWAY_USERNAME').updateValueAndValidity({emitEvent: false, onlySelf: true});
      control.get('PAYMENTSENSE_GATEWAY_PASSWORD').setErrors( {required: null} );
      control.get('PAYMENTSENSE_GATEWAY_PASSWORD').updateValueAndValidity({emitEvent: false, onlySelf: true});
      control.get('PAYMENTSENSE_JWT_TOKEN').setErrors( {required: null} );
      control.get('PAYMENTSENSE_JWT_TOKEN').updateValueAndValidity({emitEvent: false, onlySelf: true});

      if (!!paymentSenseUsername || !!password || !!jwtToken) {
        if (!paymentSenseUsername) {
          control.get('PAYMENTSENSE_GATEWAY_USERNAME').setErrors( {required: true} );
        }
        if (!password) {
          control.get('PAYMENTSENSE_GATEWAY_PASSWORD').setErrors( {required: true} );
        }
        if (!jwtToken) {
          control.get('PAYMENTSENSE_JWT_TOKEN').setErrors( {required: true} );
        }
      }

      return null;

    };

  }

}
