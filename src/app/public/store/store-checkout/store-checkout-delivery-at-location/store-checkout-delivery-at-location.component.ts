import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ClientStore, Order, LocationValid, LocationType } from 'src/app/stores/stores';
import { OrderMetaData, Cart, OrderMetaState } from '../../+state/stores.reducer';
import { select, Store } from '@ngrx/store';
import { HelperService } from 'src/app/public/helper.service';
import {
  getCurrentCartState,
  getSelectedStore,
  getCurrentCartUuid,
  getStoreLocationsState,
  getCurrentOrderMetaState,
  getCurrentCartStatus
} from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { ValidateStoreLocations, AddOrderMeta, AddCheckoutState } from '../../+state/stores.actions';
import { CheckoutService, PICKUP_METHOD } from '../checkout.service';
import { CustomValidators } from '../../../../shared/custom.validators';
import { LocationService } from 'src/app/public/location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreLocationService } from 'src/app/stores/store-location/store-location.service';
import { getSelectedStoreLocation } from 'src/app/stores/store-location/+state/store-location.selectors';
import { CookieService } from 'ngx-cookie-service';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Component({
  selector: 'app-store-checkout-delivery-at-location',
  templateUrl: './store-checkout-delivery-at-location.component.html',
  styleUrls: ['./store-checkout-delivery-at-location.component.scss']
})
export class StoreCheckoutDeliveryAtLocationComponent implements OnInit, OnDestroy {

  checkoutOptionsForm: FormGroup;
  personalInfoForm: FormGroup;
  checkoutStateData: {};
  selectedStore: ClientStore;
  cart$: Observable<Order>;
  cartData: Order;
  cartStatus: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderMetaData: OrderMetaState;
  orderUuid: string;
  selectedPickupMethod: number;
  addToCartDisabled: boolean;
  addedToCart: boolean;
  storeLocation: string | number;
  storeLocationType: string;
  locationDescription: string;
  validationTimer = null;
  validLocations: LocationValid = null;
  locationPersistedInMemory =  false;
  PICKUP_METHOD = PICKUP_METHOD;
  storeId: number;
  isStoreVisitor = false;
  isStoreOpen = false;
  locationResponse = true;
  locationId: number;
  isPinValid = false;
  isTapIdExpired = true;

  constructor(
    private fb: FormBuilder,
    private store: Store<Cart>,
    private helper: HelperService,
    public checkoutService: CheckoutService,
    public location: LocationService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private storeLocationService: StoreLocationService,
    private cookieService: CookieService,
    ) {}

  ngOnInit() {
    // disable order button
    this.invalidateSubmit(true);

    this.store.select(getStoreLocationsState)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(state => {
      if (state && this.selectedStore && state.isValid && state.id !== -1) {
        this.validLocations = state;
        if (this.validLocations) {
          this.locationId = this.validLocations.id;
          this.isStoreOpen = this.validLocations.status === 'OPEN' ? true : false;
          if (this.cookieService.get(this.storeId + '_' + this.locationId + '_' + 'ONE_TAP')) {
            this.isTapIdExpired = false;
            const tapId = JSON.parse(this.cookieService.get(this.storeId + '_' + this.locationId + '_' + 'ONE_TAP'));
            this.checkoutService.setOrderMetaState('tapId', tapId);
            this.invalidateSubmit(false);
          }
        }
      }
    });

    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentCartState),
      this.store.select(getStoreLocationsState),
      this.store.select(getCurrentOrderMetaState)
    ]).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state[0]) {
          this.selectedStore = state[0];
          this.storeId = state[0].id;
        }
        if (state && state[4]) {
          this.orderMetaData = state[4];
          this.checkoutService.setCheckoutState('locationPersistedInMemory', !!this.orderMetaData.data.location);
          if (this.orderMetaData.data.location) {
            this.storeLocation = this.orderMetaData.data.location;
            this.checkoutService.setCheckoutState('storeLocation', this.storeLocation);
          }
          this.updatePickupValidationRules();
        }
        if (this.checkoutService.getValidLocations() && this.checkoutService.isValidLocation()) {
          // the location must NEVER be persisted here otherwise
          // it will cause a loop on the second order
          // this.persistDirectOrderDetails('location', state.id);
          // we could howerver update the input field value
          // if we want to persist the location across multiple orders
          // and the last entered location is valid, but BE needs to
          // also return the location label, as we only display
          // label in the input field
          // this.storeLocation = state.LABEL_NEEDS_TO_COME_FROM_BE;
          this.storeLocation = (this.checkoutService.getValidLocations().label)
            ? this.checkoutService.getValidLocations().label
            : this.checkoutService.cartData.location;
          this.storeLocationType = (this.checkoutService.getValidLocations().locationType);
          this.locationDescription = (this.checkoutService.getValidLocations().description);
          this.checkoutService.setCheckoutState('storeLocation', this.storeLocation.toString());
        } else {
          this.storeLocationType = '';
          this.locationDescription = '';
        }

    });
    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.unsubscribe$)
    ).subscribe(s => {
      if (!(s && s.storeRoles && this.storeId && (s.superAdmin || s.affiliate)
        || (this.storeId && (s.storeRoles[+this.storeId] === 'STORE_ADMIN' || s.storeRoles[+this.storeId] === 'STORE_STANDARD')))) {
        this.isStoreVisitor = true;
      }
    });

    combineLatest([this.store.select(getCurrentCartStatus)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state[0]) {
          case 'ORDERUPDATING':
            // this.invalidateSubmit(true);
            break;
          case 'LOADED':
            this.updatePickupValidationRules();
            break;
        }
      });

    // uninvalidate submit and validate location
    if (this.checkoutService.validCartLocation()) {
      this.invalidateSubmit(false);
      this.selectedPickupMethod = PICKUP_METHOD.AT_LOCATION;
      this.storeLocation = this.checkoutService.cartData.location;
      this.checkoutService.setCheckoutState('storeLocation', this.storeLocation.toString());
      if (this.checkoutService.validateCartLocation()) {
        this.store.dispatch(new ValidateStoreLocations( this.checkoutService.selectedStore.id, this.checkoutService.storeLocation));
      }
    }

    // set validation pickup rules:
    let deliveryMethod = '';
    let slocation: string | number = '';
    if (this.checkoutService.orderMetaData && this.checkoutService.orderMetaData.data.deliveryMethod) {
      deliveryMethod = this.checkoutService.orderMetaData.data.deliveryMethod;
    }
    if (this.checkoutService.selectedPickupMethod === PICKUP_METHOD.AT_LOCATION
        && (this.checkoutService.getValidLocations() || this.checkoutService.storeLocation))  {
      deliveryMethod = '0';
      slocation = this.storeLocation;
      if (!location && this.checkoutService.getValidLocations()) {
        slocation = this.checkoutService.getValidLocations().label;
      }
    }
    this.checkoutOptionsForm = this.fb.group({
      receiveOrderType: [deliveryMethod, Validators.compose([Validators.required])],
      table: [slocation, Validators.compose([Validators.required, Validators.maxLength(10)])],
      pinnumber: [slocation, Validators.compose([Validators.required,
      Validators.maxLength(4), Validators.pattern('^[0-9]*$')])],
    }, {
      validator: [CustomValidators.checkForOnlySpaces('table')]
    });
    this.updatePickupValidationRules();
  } // EOF: ngOnInit

  updatePickupValidationRules() {
    // set checkout options form validator rules
    let location: string | number = '';

    if (this.getControl('receiveOrderType', 'checkoutOptionsForm') && this.checkoutService.getPickupMethod()) {
      this.getControl('receiveOrderType', 'checkoutOptionsForm').setValue(this.checkoutService.getPickupMethod());
    }

    if (
      this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_LOCATION &&
      (
        this.checkoutService.getValidLocations() ||
        this.location.getUrlStoreLocation()
      )
    ) {
      location = this.location.getUrlStoreLocation();
      if (!location && this.checkoutService.getValidLocations()) {
        location = this.checkoutService.getValidLocations().label;
      }
    }
    if (this.checkoutService.getPickupMethodAsInt() > PICKUP_METHOD.AT_LOCATION) {
      this.invalidateSubmit(false);
    }

    if (this.getControl('table', 'checkoutOptionsForm')) {
      if (
        this.checkoutService.getLocationInitiallyPersisted() ||
        (
          !this.checkoutService.getLocationInitiallyPersisted() &&
          this.checkoutService.isValidLocation()
        )
      ) {
        this.getControl('table', 'checkoutOptionsForm').setValue(location.toString());
        this.getControl('table', 'checkoutOptionsForm').markAsTouched();
        this.getControl('table', 'checkoutOptionsForm').setErrors(null);
        this.getControl('table', 'checkoutOptionsForm').setValidators([Validators.required, Validators.maxLength(10)]);
        this.getControl('table', 'checkoutOptionsForm').updateValueAndValidity();
        this.invalidateSubmit(false);
      } else {
        this.getControl('table', 'checkoutOptionsForm').markAsTouched();
        this.getControl('table', 'checkoutOptionsForm').setValidators([Validators.required, Validators.maxLength(10)]);
        this.getControl('table', 'checkoutOptionsForm').setErrors({invalidLocation: true }, true);
      }
    }
  }

  validateLocation(field, formData: string = 'checkoutOptionsForm') {
    if (this.getControl(field, formData).value !== '') {
        if (this.helper.checkLocationInputValidity(this.getControl(field, formData).value)) {
          this.store.dispatch(new ValidateStoreLocations(
            this.checkoutService.selectedStore.id,
            this.getControl(field, formData).value.toUpperCase()
          ));
        }
    }

    if (this.checkoutService.validLocations) {
      this.locationId = this.checkoutService.validLocations.id;
      this.isStoreOpen = this.checkoutService.validLocations.status === 'OPEN' ? true : false;
      if (this.cookieService.get(this.storeId + '_'  + this.locationId + '_' + 'ONE_TAP')) {
        this.isTapIdExpired = false;
        const tapId = JSON.parse(this.cookieService.get(this.storeId + '_'  + this.locationId + '_' + 'ONE_TAP'));
        this.checkoutService.setOrderMetaState('tapId', tapId);
        // this.checkoutService.setCheckoutState('orderBtnDisabled', false);
        this.invalidateSubmit(false);
      }
    }
  }

  checkValidateLocation() {
    this.invalidateSubmit(true);
    this.checkoutService.setCheckoutState('locationInitiallyPersisted', false);
    if (this.getControl('table', 'checkoutOptionsForm')) {
      this.getControl('table', 'checkoutOptionsForm').setValue( this.getControl('table', 'checkoutOptionsForm').value.toUpperCase() );
      if (this.helper.checkLocationInputValidity(this.getControl('table', 'checkoutOptionsForm').value, 1, 10)) {
        this.getControl('table', 'checkoutOptionsForm').markAsTouched();
        this.getControl('table', 'checkoutOptionsForm').setErrors(null);
      } else {
        this.getControl('table', 'checkoutOptionsForm').markAsTouched();
        this.getControl('table', 'checkoutOptionsForm').setErrors({invalidLocation: true }, true);
      }
    }

    if (this.validationTimer) {
      clearTimeout(this.validationTimer);
      this.validationTimer = null;
    }
    this.validationTimer = setTimeout(() => {
      if (  this.getControl('table', 'checkoutOptionsForm').valid ) {
        this.validateLocation('table', 'checkoutOptionsForm');
      }
    }, 300);
  }

  invalidateSubmit(orderBtnDisabled: boolean, debug = '') {
    if (debug !== '') {
      console.log(
        'trying to invalidate:',
        orderBtnDisabled,
        this.checkoutService.getPickupMethodAsInt(),
        this.checkoutOptionsForm && this.checkoutOptionsForm.valid,
        !this.checkoutOptionsForm,
        this.checkoutOptionsForm
      );
    }
    if (
      !orderBtnDisabled &&
      (this.checkoutService.getPickupMethodAsInt() > PICKUP_METHOD.AT_LOCATION ||
        (this.checkoutService.getPickupMethodAsInt() === PICKUP_METHOD.AT_LOCATION &&
          (!this.checkoutOptionsForm || !!(this.checkoutOptionsForm && this.checkoutOptionsForm.valid)
          )
        )
      ) && this.isPinValid
    ) {
      this.store.dispatch(new AddCheckoutState('orderBtnDisabled', false));
    } else if (this.isTapIdExpired && this.isStoreVisitor && !this.isPinValid && this.isStoreOpen
               && this.checkoutService.orderMetaData.data.deliveryMethod === '0') { // deliveryMethod = 0 = TABLE
      this.store.dispatch(new AddCheckoutState('orderBtnDisabled', true));
      this.getControl('pinnumber', 'checkoutOptionsForm').setErrors({ invalidPin: true }, true);
    } else {
      this.store.dispatch(new AddCheckoutState('orderBtnDisabled', false));
    }
  }

  setPickupMethod(id: number, persist = false) {
    this.selectedPickupMethod = id;
    if (persist) {
      this.checkoutService.setOrderMetaState('deliveryMethod', id.toString());
    }
  }

  getControl(name: string, form: string = 'checkoutOptionsForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  addOrderMeta(metaKey, control, formGroup = '') {
    this.store.dispatch(new AddOrderMeta(metaKey, this.getControl(control, formGroup).value));
  }

  clearLocation() {
    this.location.clearStoreLocationUrl();
    this.router.navigateByUrl(this.location.base_url(`cart`));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public get LocationType(): typeof LocationType {
    return LocationType;
  }

  validatePin() {
    this.invalidateSubmit(true);
    this.isPinValid = false;
    const isNumericPin = /^[0-9]+$/.test(this.getControl('pinnumber', 'checkoutOptionsForm').value.toString());
    if (this.getControl('pinnumber', 'checkoutOptionsForm').value.toString().length === 4 && isNumericPin) {
      this.storeLocationService.validPin(this.storeId, this.locationId, this.getControl('pinnumber', 'checkoutOptionsForm').value).
        subscribe(res => {
          this.isPinValid = res.isPinValid;
          if (res.isPinValid) {
            this.invalidateSubmit(false);
            const cookieName = this.storeId + '_' + this.locationId + '_' + 'ONE_TAP';
            this.cookieService.set(cookieName, res.tapId.toString(), 1); // storing tapId for 24 hours/a day.
            this.checkoutService.setOrderMetaState('tapId', res.tapId.toString());
            this.getControl('pinnumber', 'checkoutOptionsForm').setErrors(null);
          } else {
            this.getControl('pinnumber', 'checkoutOptionsForm').setErrors({ invalidPin: true }, true);
          }
        });
    } else {
      this.getControl('pinnumber', 'checkoutOptionsForm').setErrors({ invalidPin: true }, true);
    }
  }
}
