import { UpdateStoreSettings, UpdateStore, PartialUpdateStore } from './../+state/stores.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CustomValidators } from 'src/app/shared/custom.validators';

@Component({
  selector: 'app-store-settings-update',
  templateUrl: './store-settings-update.component.html',
  styleUrls: ['./store-settings-update.component.scss']
})
export class StoreSettingsUpdateComponent implements OnInit, OnDestroy {
  currentStore: string;
  paymentEnabled: boolean;
  deliveryLocationsEnabled: boolean;
  orderingDisabled: boolean;
  settingsForm: FormGroup = this.fb.group({});
  settings: { [key: string]: any };
  destroyed$ = new Subject<void>();
  hubriseConnected: boolean;

  constructor(private fb: FormBuilder, private store: Store<StoresState>) {
  }

  ngOnInit() {
    this.settingsForm = this.fb.group({
      DELIVERY_IN_STORE_LOCATION: [''],
      DELIVERY_NO_LOCATION: [''],
      DELIVERY_ADDRESS: [''],
      ENABLE_ORDERING: [''],
      ORDER_NOTIFICATION_EMAIL_STATUS_CHANGE: [''],
      BASKET_ENABLED: [''],
      PAYMENT_OPTION: [''],
      OPTIONAL_PAYMENT_PRESELECTED: [''],
      ENABLE_CUSTOMER_AUTHENTICATION: [''],
      HIDE_ORDER_ITEM_COMMENTS: [''],
      HIDE_ORDER_COMMENTS: [''],
      ADD_BASKET_ONE_CLICK: [''],
      DEFAULT_MIN_ESTIMATED_DURATION_READY: ['0', Validators.min(0)],
      DEFAULT_MAX_ESTIMATED_DURATION_READY: ['0', Validators.max(1000)],
      ORDER_NOTIFICATION_EMAIL: ['', Validators.compose([Validators.required, CustomValidators.email, Validators.maxLength(254)])],
      ORDER_NOTIFICATION_SOUND: [''],
      ALLOW_ORDER_CHANGE: [''],
      ALLOW_ORDER_DELETE: [''],
      ONLINE_PAYMENT_EXTERNAL_ID: ['', Validators.compose([Validators.maxLength(100)])],
      NON_ONLINE_PAYMENT_EXTERNAL_ID: ['', Validators.compose([Validators.maxLength(100)])],
      DELIVERY_IN_STORE_LOCATION_EXTERNAL_ID: ['', Validators.compose([Validators.maxLength(100)])],
      DELIVERY_NO_LOCATION_EXTERNAL_ID: ['', Validators.compose([Validators.maxLength(100)])],
      DELIVERY_ADDRESS_EXTERNAL_ID: ['', Validators.compose([Validators.maxLength(100)])]
    });
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.settings = s.settings;
      this.paymentEnabled = s.settings.PAYMENT_PAYPAL_ENABLED ||
        s.settings.PAYMENT_STRIPE_CREDIT_CARD_ENABLED ||
        s.settings.PAYMENT_STRIPE_IDEAL_ENABLED ||
        s.settings.PAYMENT_STRIPE_BANCONTACT_ENABLED ||
        s.settings.PAYMENT_PAYMENTSENSE_CREDIT_CARD_ENABLED ||
        s.settings.PAYMENT_SQUARE_CREDIT_CARD_ENABLED ||
        s.settings.PAYMENT_VIVA_CREDIT_CARD_ENABLED ||
        s.settings.PAYMENT_STRIPE_DIGITAL_WALLETS_ENABLED;
      this.deliveryLocationsEnabled = !!s.numberOfLocations;
      this.orderingDisabled = !this.settings.ENABLE_ORDERING;
      this.settingsForm.patchValue(
        s.settings
      );
      this.currentStore = s.aliasName;
      if (s.settings.HUBRISE_ACCESS_TOKEN && s.settings.HUBRISE_LOCATION_NAME &&
        s.settings.HUBRISE_CATALOG_NAME && s.settings.HUBRISE_CUSTOMER_LIST_NAME) {
          this.hubriseConnected = true;
        } else {
          this.hubriseConnected = false;
        }
    });

  }


  get email() {
    return this.settingsForm.get('ORDER_NOTIFICATION_EMAIL');
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit(btn = null) {
    if (this.defaultMinNumber.invalid || this.defaultMinNumber.errors) {
      return;
    }
    if (this.defaultMaxNumber.invalid || this.defaultMaxNumber.errors) {
      return;
    }
    if (this.onlinePaymentExternalId.invalid || this.onlinePaymentExternalId.errors) {
      return;
    }
    if (this.nonOnlinePaymentExternalId.invalid || this.nonOnlinePaymentExternalId.errors) {
      return;
    }
    if (this.deliveryInStoreLocationExteranlId.invalid || this.deliveryInStoreLocationExteranlId.errors) {
      return;
    }
    if (this.deliveryNoLocationExteranlId.invalid || this.deliveryNoLocationExteranlId.errors) {
      return;
    }
    if (this.deliveryAddressExteranlId.invalid || this.deliveryAddressExteranlId.errors) {
      return;
    }
    const settings = this.settingsForm.getRawValue();
    if (btn === 'ordering') {
      if (!settings.DELIVERY_IN_STORE_LOCATION && !settings.DELIVERY_NO_LOCATION && !settings.DELIVERY_ADDRESS) {
        settings.ENABLE_ORDERING = false;
        this.settingsForm.patchValue(settings);
        return;
      }
    }

    if (!settings.DELIVERY_IN_STORE_LOCATION && !settings.DELIVERY_NO_LOCATION && !settings.DELIVERY_ADDRESS) {
      settings.ENABLE_ORDERING = false;
    }

    if ((settings.DELIVERY_IN_STORE_LOCATION || settings.DELIVERY_NO_LOCATION || settings.DELIVERY_ADDRESS) && !btn) {
      if (!settings.ENABLE_ORDERING) {
        settings.ENABLE_ORDERING = true;
      }
    }

    if (settings.ENABLE_ORDERING) {
      settings.BASKET_ENABLED = true;
    }

    if (!settings.ENABLE_ORDERING && btn === 'basket') {
      settings.BASKET_ENABLED = settings.BASKET_ENABLED ? false : true;
    } else {
      this.settingsForm.patchValue(settings);
    }
    this.store.dispatch(new UpdateStoreSettings(this.settingsForm.getRawValue()));
  }
  get defaultMinNumber() {
    return this.settingsForm.get('DEFAULT_MIN_ESTIMATED_DURATION_READY');
  }
  get defaultMaxNumber() {
    return this.settingsForm.get('DEFAULT_MAX_ESTIMATED_DURATION_READY');
  }
  get onlinePaymentExternalId() {
    return this.settingsForm.get('ONLINE_PAYMENT_EXTERNAL_ID');
  }
  get nonOnlinePaymentExternalId() {
    return this.settingsForm.get('NON_ONLINE_PAYMENT_EXTERNAL_ID');
  }
  get deliveryInStoreLocationExteranlId() {
    return this.settingsForm.get('DELIVERY_IN_STORE_LOCATION_EXTERNAL_ID');
  }
  get deliveryNoLocationExteranlId() {
    return this.settingsForm.get('DELIVERY_NO_LOCATION_EXTERNAL_ID');
  }
  get deliveryAddressExteranlId() {
    return this.settingsForm.get('DELIVERY_ADDRESS_EXTERNAL_ID');
  }
}
