import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresState } from '../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ConnectJCC, DisConnectJCC } from '../+state/payment.actions';

@Component({
  selector: 'app-store-payment-jcc',
  templateUrl: './store-payment-jcc.component.html',
  styleUrls: ['./store-payment-jcc.component.scss']
})
export class StorePaymentJccComponent implements OnInit, OnDestroy {

  public showFields: boolean;
  public jccConnected: boolean;
  public jccForm: FormGroup;
  public jccEnabled: boolean;
  public jccMerchantId: boolean;
  private destroy$ = new Subject();

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.jccForm = this.fb.group({
      JCC_MERCHANT_ID: ['', Validators.compose([Validators.required, Validators.maxLength(100), Validators.pattern('^[0-9]*$')])],
      JCC_ACQUIRER_ID: ['', Validators.compose([Validators.required, Validators.maxLength(100), Validators.pattern('^[0-9]*$')])],
      JCC_API_SIGNATURE_PASSWORD: ['', Validators.compose([Validators.required, Validators.maxLength(100)])]
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.settings.JCC_MERCHANT_ID && s.settings.JCC_ACQUIRER_ID && s.settings.JCC_API_SIGNATURE_PASSWORD){
        this.jccForm.patchValue(s.settings, {emitEvent: false});
        this.jccConnected = true;
        this.jccMerchantId = s.settings.JCC_MERCHANT_ID;
        this.jccEnabled = s.settings.PAYMENT_JCC_CREDIT_CARD_ENABLED;
      } else {
        this.jccConnected = false;
        this.jccMerchantId = false;
        this.jccEnabled = false;
      }
    });

    this.jccForm.valueChanges.subscribe(v => {
      if (!v.JCC_MERCHANT_ID.trim() &&
         !v.JCC_ACQUIRER_ID.trim() &&
         !v.JCC_API_SIGNATURE_PASSWORD.trim() &&
         !this.jccConnected
         ){
          this.jccEnabled = false;
          this.toggleJCCPayments(false);
      }
    });
  }

  onJCCClicked(){
    this.showFields = true;
  }

  getControl(name: string) {
    return this.jccForm.get(name);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  connect(){
    this.jccForm.markAllAsTouched();
    const formData = this.jccForm.getRawValue();
    if (
      this.jccForm.valid &&
      formData.JCC_MERCHANT_ID.trim() &&
      formData.JCC_ACQUIRER_ID.trim() &&
      formData.JCC_API_SIGNATURE_PASSWORD.trim()
    ) {
      this.store.dispatch(new ConnectJCC({
        merchantId: formData.JCC_MERCHANT_ID,
        acquirerId: formData.JCC_ACQUIRER_ID,
        apiSignaturePassword: formData.JCC_API_SIGNATURE_PASSWORD,
      }));
    }
  }

  disconnect() {
    this.store.dispatch(new DisConnectJCC());
  }

  toggleJCCPayments(e){
    if (this.jccForm.controls.JCC_MERCHANT_ID.value.trim().length === 0
        && this.jccForm.controls.JCC_ACQUIRER_ID.value.trim().length === 0
        && this.jccForm.controls.JCC_API_SIGNATURE_PASSWORD.value.trim().length === 0
        && e) {
      setTimeout(() => {
          this.jccEnabled = false;
      });
      return;
    }
    if (this.jccForm.valid) {
        const formData = this.jccForm.getRawValue();
        this.store.dispatch(new UpdateStoreSettings({
          PAYMENT_JCC_CREDIT_CARD_ENABLED: e
        }));
    } else {
        setTimeout(() => {
            this.jccEnabled = false;
        });

    }
  }
}
