import { Component, OnDestroy, OnInit } from '@angular/core';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresState } from '../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { ConnectTrustPayments, DisconnectTrustPayments } from '../+state/payment.actions';

@Component({
  selector: 'app-store-payment-trustpayments',
  templateUrl: './store-payment-trustpayments.component.html',
  styleUrls: ['./store-payment-trustpayments.component.scss']
})
export class StorePaymentTrustpaymentsComponent implements OnInit, OnDestroy {

  public showFields: boolean;
  private destroy$ = new Subject();
  public trustpaymentsForm: FormGroup;
  public trustpaymentsEnabled: boolean;
  public trustpaymentsConnected: boolean;
  public siteReference: string;
  public webserviceUser: string;
  public webservicePassword: string;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit(): void {

    this.trustpaymentsForm = this.fb.group({
      TRUSTPAYMENTS_SITE_REFERENCE: ['', Validators.compose([Validators.maxLength(100)])],
      TRUSTPAYMENTS_WEBSERVICE_USER: ['', Validators.compose([Validators.maxLength(100)])],
      TRUSTPAYMENTS_WEBSERVICE_PASSWORD: ['', Validators.compose([Validators.maxLength(100)])]
    });

    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
        if (s.settings.TRUSTPAYMENTS_SITE_REFERENCE &&
            s.settings.TRUSTPAYMENTS_WEBSERVICE_USER &&
            s.settings.TRUSTPAYMENTS_WEBSERVICE_PASSWORD ) {
          this.trustpaymentsForm.patchValue(s.settings, {emitEvent: false});
          this.siteReference = s.settings.TRUSTPAYMENTS_SITE_REFERENCE;
          this.webserviceUser = s.settings.TRUSTPAYMENTS_WEBSERVICE_USER;
          this.webservicePassword = s.settings.TRUSTPAYMENTS_WEBSERVICE_PASSWORD;
          this.trustpaymentsEnabled = s.settings.PAYMENT_TRUSTPAYMENTS_CREDIT_CARD_ENABLED;
          this.trustpaymentsConnected = true;
        } else {
          this.siteReference = '';
          this.trustpaymentsEnabled = false;
          this.trustpaymentsConnected = false;
        }
    });

    this.trustpaymentsForm.valueChanges.subscribe(v => {
      if (!v.TRUSTPAYMENTS_SITE_REFERENCE.trim() &&
          !v.TRUSTPAYMENTS_WEBSERVICE_USER.trim() &&
          !v.TRUSTPAYMENTS_WEBSERVICE_PASSWORD.trim() &&
          !this.trustpaymentsConnected &&
          this.trustpaymentsEnabled) {
        this.trustpaymentsEnabled = false;
        this.toggleTrustpaymentsPayments(false);
      }
    });
  }

  onTrustpaymentsClicked() {
    this.showFields = true;
  }

  connect() {
    this.trustpaymentsForm.markAllAsTouched();
    const form = this.trustpaymentsForm.getRawValue();
    if (this.trustpaymentsForm.valid &&
      form.TRUSTPAYMENTS_SITE_REFERENCE &&
      form.TRUSTPAYMENTS_WEBSERVICE_USER &&
      form.TRUSTPAYMENTS_WEBSERVICE_PASSWORD) {
      this.store.dispatch(new ConnectTrustPayments({
        sitereference: form.TRUSTPAYMENTS_SITE_REFERENCE,
        webserviceUser: form.TRUSTPAYMENTS_WEBSERVICE_USER,
        webservicePassword: form.TRUSTPAYMENTS_WEBSERVICE_PASSWORD,
      }));
    }
  }

  disconnect() {
    this.store.dispatch(new DisconnectTrustPayments());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.trustpaymentsForm.get(name);
  }

  toggleTrustpaymentsPayments(e) {
    if (this.trustpaymentsForm.controls.TRUSTPAYMENTS_SITE_REFERENCE.value.trim().length === 0 &&
        this.trustpaymentsForm.controls.TRUSTPAYMENTS_WEBSERVICE_USER.value.trim().length === 0 &&
        this.trustpaymentsForm.controls.TRUSTPAYMENTS_WEBSERVICE_PASSWORD.value.trim().length === 0 &&
        e) {
      setTimeout(() => {
          this.trustpaymentsEnabled = false;
      });
      return;
    }
    if (this.trustpaymentsForm.valid) {
        const formData = this.trustpaymentsForm.getRawValue();
        this.store.dispatch(new UpdateStoreSettings({PAYMENT_TRUSTPAYMENTS_CREDIT_CARD_ENABLED: e}));
    } else {
        setTimeout(() => {
            this.trustpaymentsEnabled = false;
        });

    }
  }
}
