import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../../+state/stores.reducer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DisconnectPowersoft, PowersoftLogin, UpdateStoreSettings } from '../../+state/stores.actions';
import { getSelectedStore } from '../../+state/stores.selectors';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ClientStore } from '../../stores';

@Component({
  selector: 'app-store-integrations-powersoft',
  templateUrl: './store-integrations-powersoft.component.html',
  styleUrls: ['./store-integrations-powersoft.component.scss']
})
export class StoreIntegrationsPowersoftComponent implements OnInit {
  private destroy$ = new Subject();
  public showFields: boolean;
  public powersoftConnected: boolean;
  public powersoftForm: FormGroup;
  public powersoftAccessTokenID: boolean;
  public powersoftAgentCodeID: boolean;
  public powersoftGenercCustomerCodeID: boolean;
  public powersoftGenercCustomerEmailID: boolean;
  selectedStore: ClientStore;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.powersoftForm = this.fb.group({
      POWERSOFT_ACCESS_TOKEN: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      POWERSOFT_AGENT_CODE: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      POWERSOFT_GENERIC_CUSTOMER_CODE: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      POWERSOFT_GENERIC_CUSTOMER_EMAIL: ['', Validators.compose([Validators.required, Validators.maxLength(100)])]
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
  ).subscribe(s => {
    this.selectedStore = s;
    if (s.settings.POWERSOFT_ACCESS_TOKEN && s.settings.POWERSOFT_AGENT_CODE &&
        s.settings.POWERSOFT_GENERIC_CUSTOMER_CODE && s.settings.POWERSOFT_GENERIC_CUSTOMER_EMAIL) {
        this.powersoftForm.patchValue(s.settings, {emitEvent: false});
        this.powersoftConnected = true;
        this.powersoftAccessTokenID = s.settings.POWERSOFT_ACCESS_TOKEN;
        this.powersoftAgentCodeID = s.settings.POWERSOFT_AGENT_CODE;
        this.powersoftGenercCustomerCodeID = s.settings.POWERSOFT_GENERIC_CUSTOMER_CODE;
        this.powersoftGenercCustomerEmailID = s.settings.POWERSOFT_GENERIC_CUSTOMER_EMAIL;
      } else{
        this.powersoftConnected = false;
        this.powersoftAccessTokenID = false;
        this.powersoftAgentCodeID = false;
        this.powersoftGenercCustomerCodeID = false;
        this.powersoftGenercCustomerEmailID = false;
      }
  });
  }

  onPowersoftClicked() {
    this.showFields = true;
  }
  connect() {
    this.powersoftForm.markAllAsTouched();
    if (this.powersoftForm.valid) {
      const form = this.powersoftForm.getRawValue();
      const rawForm = {
        accessToken: form.POWERSOFT_ACCESS_TOKEN,
        agentCode: form.POWERSOFT_AGENT_CODE,
        genericCustomerCode: form.POWERSOFT_GENERIC_CUSTOMER_CODE,
        genericCustomerEmail: form.POWERSOFT_GENERIC_CUSTOMER_EMAIL
      };
      this.store.dispatch(new PowersoftLogin(this.selectedStore.id, rawForm));
    }
  }

  disconnect() {
    const form = {
      POWERSOFT_ACCESS_TOKEN: null,
      POWERSOFT_AGENT_CODE: null,
      POWERSOFT_GENERIC_CUSTOMER_CODE: null,
      POWERSOFT_GENERIC_CUSTOMER_EMAIL: null
    };
    this.store.dispatch(new DisconnectPowersoft(this.selectedStore.id));
  }

  onDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.powersoftForm.get(name);
  }

}
