import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ClientStore, Order, LocationValid } from 'src/app/stores/stores';
import { OrderMetaData, Cart } from '../../+state/stores.reducer';
import { Store } from '@ngrx/store';
import { HelperService } from 'src/app/public/helper.service';
import { getSelectedStore, getCurrentCartUuid } from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { ValidateStoreLocations, AddOrderMeta, UpdateDeliveryMethod } from '../../+state/stores.actions';
import { CheckoutService, PICKUP_METHOD } from '../checkout.service';
import { LocationService } from 'src/app/public/location.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store-checkout-delivery',
  templateUrl: './store-checkout-delivery.component.html',
  styleUrls: ['./store-checkout-delivery.component.scss']
})
export class StoreCheckoutDeliveryComponent implements OnInit, OnDestroy {

  checkoutOptionsForm: FormGroup;
  personalInfoForm: FormGroup;
  checkoutStateData: {};
  selectedStore: ClientStore;
  cart$: Observable<Order>;
  cartData: Order;
  cartStatus: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderMetaData: OrderMetaData;
  orderUuid: string;
  selectedPickupMethod: number;
  addToCartDisabled: boolean;
  addedToCart: boolean;
  storeLocation: string | number;
  validationTimer = null;
  validLocations: LocationValid = null;
  locationPersistedInMemory =  false;
  PICKUP_METHOD = PICKUP_METHOD;
  isAdminOrderUpdate = true;

  @Output() scrollTo = new EventEmitter();
  @ViewChild('ShowMultipleChoice')  ShowMultipleChoice: ElementRef;
  constructor(
    private fb: FormBuilder,
    private store: Store<Cart>,
    private helper: HelperService,
    public checkoutService: CheckoutService,
    public location: LocationService,
    public router: Router,
  ) {
    this.isAdminOrderUpdate = this.location.isAdminOrderUpdate();
  }

  ngOnInit() {

    // set pickup method to undefined
    this.setPickupMethod(-1);

    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      // disabling the following part as I think they have no concern with setting pickup methods
      // and only triggering unintended order update api call after order submission...
      // but not sure if it would be okay for now, so left them as comment...
      // , this.store.select(getCurrentCartState)
      // , this.store.select(getStoreLocationsState)
      // , this.store.select(getCurrentOrderMetaState)
    ]).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {

        if (state[0]) {
          this.selectedStore = state[0];
        }
        if (this.checkoutService.ifOnlyInStore()
          || (this.checkoutService.showReadOnlyLocation())) {
          // I am sitting at a table/location
          if (
            isNaN(this.checkoutService.getPickupMethodAsInt()) ||
            this.checkoutService.getPickupMethodAsInt() !== PICKUP_METHOD.AT_LOCATION
          ) {
            this.setPickupMethod(PICKUP_METHOD.AT_LOCATION, true);
          }
        }

        if (this.checkoutService.ifOnlySelfPickup()) {
          // I will pick it up my self
          if (
            isNaN(this.checkoutService.getPickupMethodAsInt()) ||
            this.checkoutService.getPickupMethodAsInt() !== PICKUP_METHOD.MY_SELF
          ) {
            this.setPickupMethod(PICKUP_METHOD.MY_SELF, true);
          }
        }

        if (this.checkoutService.ifOnlyDeliveryToAddress()) {
          // delivery only to address
          if (
            isNaN(this.checkoutService.getPickupMethodAsInt()) ||
            this.checkoutService.getPickupMethodAsInt() !== PICKUP_METHOD.AT_ADDRESS
          ) {
            this.setPickupMethod(PICKUP_METHOD.AT_ADDRESS, true);
          }
        }

        if (
          isNaN(this.checkoutService.getPickupMethodAsInt()) &&
          this.location.getUrlStoreLocation() &&
          this.checkoutService.ifEnabledInStorePickup()
        ) {
          this.storeLocation = this.location.getUrlStoreLocation();
          // validate the location that is persisted in the  cart
          this.store.dispatch(new ValidateStoreLocations( this.checkoutService.selectedStore.id, this.storeLocation));
          this.checkoutService.setCheckoutState('storeLocation', this.storeLocation);
          this.setPickupMethod(PICKUP_METHOD.AT_LOCATION, true);
        }

        if (
          this.selectedStore &&
          this.selectedStore.settings.DEFAULT_DELIVERY_MODE &&
          this.checkoutService.ifDeliveryMethodEnabled(this.selectedStore.settings.DEFAULT_DELIVERY_MODE)
        ) {
          // if pickup method not set, default delivery method exists and is enabled, set it as pickup method...
          if (isNaN(this.checkoutService.getPickupMethodAsInt())) {
            this.setPickupMethod(
              this.checkoutService.getPickupMethodAsIntFrom(this.selectedStore.settings.DEFAULT_DELIVERY_MODE),
              true
            );
          }
        }

        if (this.checkoutService.orderMetaData && this.checkoutService.orderMetaData.data.deliveryMethod) {
          // deliveryMethod already persisted in OrderMetaData
          this.setPickupMethod(parseInt(this.checkoutService.orderMetaData.data.deliveryMethod, 10));
          this.getControl('receiveOrderType', 'checkoutOptionsForm')?.patchValue(
            this.checkoutService.orderMetaData.data.deliveryMethod, 10
          );
        }
    });

    // set validation pickup rules:
    let deliveryMethod = '';
    let slocation: string | number = '';
    if (this.checkoutService.orderMetaData && this.checkoutService.orderMetaData.data.deliveryMethod) {
      deliveryMethod = this.checkoutService.orderMetaData.data.deliveryMethod;
    }
    if (this.checkoutService.selectedPickupMethod === PICKUP_METHOD.AT_LOCATION
        && (this.checkoutService.getValidLocations() || this.checkoutService.storeLocation))  {
      deliveryMethod = PICKUP_METHOD.AT_LOCATION.toString();
      slocation = this.storeLocation;
      if (!location && this.checkoutService.getValidLocations()) {
        slocation = this.checkoutService.getValidLocations().label;
      }
    }
    this.checkoutOptionsForm = this.fb.group({
      receiveOrderType: [deliveryMethod,  Validators.compose([Validators.required])],
    });

  } // EOF: ngOnInit

  validateLocation(field, formData) {
    if (this.getControl(field, formData).value !== '') {
        if (this.helper.checkLocationInputValidity(this.getControl(field, formData).value)) {
          this.store.dispatch(new ValidateStoreLocations(
            this.checkoutService.selectedStore.id,
            this.getControl(field, formData).value.toUpperCase()
          ));
        }
    }
  }

  setPickupMethod(id: number, persist = false, scrollto = false) {
    this.selectedPickupMethod = id;
    if (persist && !this.isAdminOrderUpdate) {
      this.checkoutService.setOrderMetaState('deliveryMethod', id.toString());
      this.store.dispatch(new UpdateDeliveryMethod(id.toString()));
    }
    if (scrollto) {
      this.scrollTo.emit('');
    }
  }

  getControl(name: string, form: string = 'personalInfoForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  addOrderMeta(metaKey, control, formGroup = '') {
    this.store.dispatch(new AddOrderMeta(metaKey, this.getControl(control, formGroup).value));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
