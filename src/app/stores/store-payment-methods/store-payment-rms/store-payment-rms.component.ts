import { Component, OnDestroy, OnInit } from '@angular/core';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresState } from '../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpdateStoreSettings } from '../../+state/stores.actions';

@Component({
  selector: 'app-store-payment-rms',
  templateUrl: './store-payment-rms.component.html',
  styleUrls: ['./store-payment-rms.component.scss']
})
export class StorePaymentRmsComponent implements OnInit, OnDestroy {

  public showFields: boolean;
  private destroy$ = new Subject();
  public rmsForm: FormGroup;
  public rmsEnabled: boolean;
  public rmsConnected: boolean;
  public rmsMerchantId: boolean;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.rmsForm = this.fb.group({
      RMS_MERCHANT_ID: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      RMS_SHARED_SECRET: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      RMS_ACCOUNT_ID: ['', Validators.compose([Validators.required, Validators.maxLength(100)])]
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
        if (s.settings.RMS_MERCHANT_ID && s.settings.RMS_SHARED_SECRET && s.settings.RMS_ACCOUNT_ID) {
          this.rmsForm.patchValue(s.settings, {emitEvent: false});
          this.rmsConnected = true;
          this.rmsMerchantId = s.settings.RMS_MERCHANT_ID;
          this.rmsEnabled = s.settings.PAYMENT_RMS_CREDIT_CARD_ENABLED;
        } else{
          this.rmsConnected = false;
          this.rmsMerchantId = false;
          this.rmsEnabled = false;
        }
    });

    // tslint:disable
    this.rmsForm.valueChanges.subscribe(v => {
      if (!v.RMS_SHARED_SECRET.trim() &&
          !v.RMS_MERCHANT_ID.trim() &&
          !v.RMS_ACCOUNT_ID.trim() &&
          !this.rmsConnected
          ) {
          this.rmsEnabled = false;
          this.toggleRMSPayments(false);
      }
    });
    // tslint:enable
  }

  onRMSClicked() {
    this.showFields = true;
  }

  connect() {
    this.rmsForm.markAllAsTouched();
    if (this.rmsForm.valid) {
      const form = this.rmsForm.getRawValue();
      this.store.dispatch(new UpdateStoreSettings(form));
    }
  }

  // tslint:disable
  disconnect() {
    const form = {
      'RMS_MERCHANT_ID': null,
      'RMS_SHARED_SECRET': null,
      'RMS_ACCOUNT_ID': null
    };
    this.store.dispatch(new UpdateStoreSettings(form));
  }
  // tslint:enable


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.rmsForm.get(name);
  }

  toggleRMSPayments(e) {
    if (this.rmsForm.controls.RMS_SHARED_SECRET.value.trim().length === 0
        && this.rmsForm.controls.RMS_MERCHANT_ID.value.trim().length === 0
        && this.rmsForm.controls.RMS_ACCOUNT_ID.value.trim().length === 0
        && e) {
      setTimeout(() => {
          this.rmsEnabled = false;
      });
      return;
    }
    if (this.rmsForm.valid) {
        const formData = this.rmsForm.getRawValue();
        this.store.dispatch(new UpdateStoreSettings({PAYMENT_RMS_CREDIT_CARD_ENABLED: e, ...formData}));
    } else {
        setTimeout(() => {
            this.rmsEnabled = false;
        });

    }
  }
}
