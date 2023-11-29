import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { ClientStore, Order, LocationValid, OrderItem } from 'src/app/stores/stores';
import { Store } from '@ngrx/store';
import { Cart, OrderMetaData, OrderMetaState, ZoneState } from '../+state/stores.reducer';
import {
  getCurrentCartUuid,
  getCurrentCartState,
  getStoreLocationsState,
  getCurrentOrderMetaState,
  getCheckoutState,
  getSelectedStore,
  getZoneState,
  getStoreRules,
  getSelectedStoreOpeningHours
} from '../+state/stores.selectors';
import { LocationService } from '../../location.service';
import { AddCheckoutState, AddRuleOrderItem, AddOrderItems, AddOrderMeta, ErrorMessage } from '../+state/stores.actions';
import { FormatPrice } from 'src/app/shared/format-price.pipe';
import { DELIVERY_METHODS, DELIVERY_METHOD_VALUES } from '../types/DeliveryMethod';
import { SpecialSchedule } from 'src/app/stores/store-schedule/stores-schedule';
import dayjs from 'dayjs';

export const PICKUP_METHOD = {
  UNDEFINED:  -1,
  AT_LOCATION: 0,
  MY_SELF:     1,
  AT_ADDRESS:  2,
};
export const PAYMENT_OPTION = {
  UNDEFINED:  -1,
  PAY_LATER:   0,
  PAY_NOW:     1,
};
export const PAYMENT_METHOD = {
  UNDEFINED:  -1,
  STRIPE:      0,
  PAYPAL:      1,
  IDEAL:       2,
  BANCONTACT:  3,
  SQUARE:      4,
  VIVA:        5,
  DIGITAL_WALLETS:  6,
  PAYMENTSENSE: 7,
  RMS: 8,
  JCC: 9,
  TRUSTPAYMENTS: 10,
};

export const EMAIL_STATUS = {
  UNDEFINED:  -1,
  FAILED: 0,
  SUCCESS: 1,
  SENDING: 2,
};

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  storeRules;
  selectedStore: ClientStore;
  selectedStoreLocale: string;
  selectedStoreCurrency: string;
  selectedStoreCurrencySymbol: string;
  cartData: Order;
  cartStatus: string;
  cartItems: OrderItem[];
  storeLocation: string | number;
  orderMetaData: OrderMetaState;
  orderUuid: string;
  selectedPickupMethod: number;
  selectedPaymentOption: number;  // id of payment method: -1 - undefined; 0 - pay later; 1 - pay now
  selectedPaymentMethod: number;  // id of payment method: -1 - undefined; 0 - I will pay in store; 1 - I will pay online
  selectedDigitalPaymentMethod: string;
  validLocations: LocationValid = null;
  private checkoutStateData;
  private OrderBtnDisabled: boolean;
  addToCartDisabled: boolean;
  zoneStateData: ZoneState;
  private stripe: any;
  private stripeError: string;
  private square: any;
  private squareError = true;
  private squareNonce: string;
  private squareVerificationToken: string;
  private vivaError = true;
  private paymentSenseError = true;
  private jccError = true;
  private applicableStoreRules = [];
  private applicableFeeRules = [];
  private storeOpeningHours: SpecialSchedule = null;

  checkoutReady = false;

  constructor(  private store: Store<Cart>
              , private locationService: LocationService
              , private formatPricePipe: FormatPrice) {

    this.addToCartDisabled = true;

    this.store.select(getSelectedStoreOpeningHours)
      .subscribe((value) => {
        this.storeOpeningHours = value;
      });
    this.store.select(getStoreRules)
        .subscribe(value => {
          if (value && value.storeRulesState && value.storeRulesState.storeRules) {
            this.storeRules = value.storeRulesState.storeRules;
          }
    });

    combineLatest([
          this.store.select(getSelectedStore)
        , this.store.select(getCurrentCartUuid)
        , this.store.select(getCurrentCartState)
        , this.store.select(getStoreLocationsState)
        , this.store.select(getCurrentOrderMetaState)
    ])
    .subscribe(state => {
        if (state && state[0]) {
          this.selectedStore = state[0];
          if (this.selectedStore && this.selectedStore.address && this.selectedStore.currency) {
            this.selectedStoreLocale = this.selectedStore.address.country.defaultLocale
                                          + '-'
                                          + this.selectedStore.address.country.code;
            this.selectedStoreCurrency = this.selectedStore.currency.isoCode;
            this.selectedStoreCurrencySymbol = this.selectedStore.currency.symbol;
          }
        }
        if (state && state[1]) {
          this.orderUuid = state[1];
        }
        if (state && state[2]) {
          this.cartData = state[2];
          this.cartItems = this.cartData.orderItems;
        }
        if (state && this.selectedStore && this.orderUuid && state[3]) {
          this.validLocations = state[3];
        }
        if (state[4]) {
          this.orderMetaData = state[4];
        }
    });

    // get checkout state
    this.store.select(getCheckoutState)
              .subscribe(d => {
        if (d.checkoutState) {
          this.checkoutStateData = d.checkoutState.data;
          if (this.checkoutStateData) {
            this.OrderBtnDisabled = this.checkoutStateData.orderBtnDisabled;
          }
        }
    });

     // get zone state
    this.store.select(getZoneState)
          // .pipe(takeUntil(this.unsubscribe$))
          .subscribe(d => {
            if (d.zoneState) {
              this.zoneStateData = d.zoneState;
            }
      });
  }

  /**
   * TODO: setters should NOT be publically available
   */
  setOrderMetaState(k: string, v: string | number) {
    this.store.dispatch(new AddOrderMeta(k, v));
  }

  setCheckoutState(k: string, v: string | boolean | number) {
    this.store.dispatch(new AddCheckoutState(k, v));
  }

  getSelectedDigitalPaymentMethod() {
    return this.selectedDigitalPaymentMethod;
  }

  setSelectedDigitalPaymentMethod(selectedDigitalPaymentMethod: string) {
    this.selectedDigitalPaymentMethod = selectedDigitalPaymentMethod;
  }

  setStripe(v: any) {
    this.stripe = v;
  }

  setStripeError(v: string) {
    this.stripeError = v;
  }

  setSquare(v: any) {
    this.square = v;
  }

  setSquareError(v: boolean) {
    this.squareError = v;
  }

  setSquareNonce(v: string) {
    this.squareNonce = v;
  }

  setSquareVerificationToken(v: string) {
    this.squareVerificationToken = v;
  }

  setVivaError(v: boolean) {
    this.vivaError = v;
  }

  setJccError(v: boolean) {
    this.jccError = v;
  }

  setPaymentsenseError(p: boolean) {
    this.paymentSenseError = p;
  }

  setApplicableStoreRulesToInit() {
    this.applicableStoreRules = [];
  }

  setApplicableFeeRulesToInit() {
    this.applicableFeeRules = [];
  }

  setApplicableStoreRule(rule) {
    this.applicableStoreRules.push(rule);
  }

  setApplicableFeeRule(rule) {
    this.applicableFeeRules.push(rule);
  }

  /**
   * Total is hidden only when all items are 0 AND total is 0
   */
  shouldDisplayTotal() {
    if (!!this.cartItems) {
      for (const item of this.cartItems) {
        if (item.totalNonDiscountedPrice !== 0) {
          return true;
        }
      }
      const total = this.getCartTotal();
      return (total === 0) ? false : true;
    } else {
      return false;
    }
  }


  /**
   * GETTERS
   */
  getCartTotal(itemsOnly = false, includeRules = false) {
    let ret = 0;
    if (this.cartItems) {
      this.cartItems.forEach( item => {
        // if (!itemsOnly || (itemsOnly && (!includeRules && !this.ifOfferRule(item.offerId)))) {
        if (includeRules && item.hierarchyLevel !== 'RULE_DELIVERY_FEE' || (!includeRules && !this.ifOfferRule(item.offerId))) {
          const qty = item.quantity;
          ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
        }
        // if (item.childOrderItems) {
        //   ret += item.childOrderItems.filter(({offerPrice}) => offerPrice).reduce((price, orderItem) =>
        //                                                                             price + (qty * orderItem.offerPrice), 0);
        // }
      });
      if (!itemsOnly) {
        if (this.selectedStore &&
            ((this.getOrderFeeDelivery() && this.ifOnlyDeliveryToAddress())
            || (this.getOrderFeeDelivery() && this.getPickupMethodAsInt() === 2))
            ) {
          ret += this.getOrderFeeDelivery();
        }
        if (this.cartData.voucherDiscount) {
          ret = ret - this.cartData.voucherDiscount;
        }
      }
    }
    return ret;
  }

  getCartTotalWithoutVoucher(includeRules = false) {
    let ret = 0;
    if (this.cartItems) {
      this.cartItems.forEach( item => {
        if (includeRules && item.hierarchyLevel !== 'RULE_DELIVERY_FEE' || (!includeRules && !this.ifOfferRule(item.offerId))) {
          const qty = item.quantity;
          ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
        }
      });
      if (this.selectedStore
          && ((this.getOrderFeeDelivery() && this.ifOnlyDeliveryToAddress())
          || (this.getOrderFeeDelivery() && this.getPickupMethodAsInt() === 2))
          ) {
        ret += this.getOrderFeeDelivery();
      }
    }
    return ret;
  }

  getCartDiscountedPrice() {
    let ret = 0;
    if (this.cartData && this.cartData.voucherDiscount) {
      ret = this.cartData.totalDiscountedPrice;
    }
    return ret;
  }

  getCartDiscountType() {
    if (this.cartData && this.cartData.voucherDiscount) {
      return this.cartData.voucherDiscountType;
    }
    return null;
  }

  getCartDiscountValue() {
    if (this.cartData && this.cartData.voucherDiscount) {
      return this.cartData.voucherDiscount;
    }
    return null;
  }

  // This function is only called when voucher discount type is percentile...
  getCartDiscountPercentage() {
    if (this.cartData && this.cartData.voucherDiscountPercentage) {
      return this.cartData.voucherDiscountPercentage;
    }
    return null;
  }

  getFormattedMinAmount() {
    if (this.selectedStore) {
      return this.formatPricePipe.transform(
        this.getOrderMinAmountDelivery(),
        this.selectedStoreLocale,
        this.selectedStoreCurrency,
        this.selectedStoreCurrencySymbol
      );
    }
    return '';
  }
  getLocationInitiallyPersisted() {
    return this.checkoutStateData.locationInitiallyPersisted;
  }
  getOrderMetaData(k: string) {
    if (this.orderMetaData && this.orderMetaData.data[k]) {
      return this.orderMetaData.data[k];
    }
    return '';
  }
  getCheckoutMetaData(k: string) {
    if (this.checkoutStateData && this.checkoutStateData[k]) {
      return this.checkoutStateData[k];
    }
    return '';
  }
  getCheckoutMetaDataValue(k: string) {
    if (this.checkoutStateData && (k in this.checkoutStateData)) {
      return this.checkoutStateData[k];
    }
    return '';
  }
  /**
   * check if CheckoutMetaData key is set to any value
   * @param k CheckoutMetaData key
   */
  isCheckoutMetaData(k: string) {
    if (this.checkoutStateData && (k in this.checkoutStateData)) {
      return true;
    }
    return false;
  }

  // payment getters
  getPickupMethod() {
    return this.orderMetaData.data.deliveryMethod;
  }
  getPickupMethodStr() {
    if (this.orderMetaData && this.orderMetaData.data.deliveryMethod) {
      return DELIVERY_METHODS[this.orderMetaData.data.deliveryMethod];
    } else {
      return null;
    }
  }
  getPickupMethodAsInt() {
    return parseInt(this.orderMetaData.data.deliveryMethod, 10);
  }
  getPickupMethodAsIntFrom(deliveryMethod: string) {
    return parseInt(DELIVERY_METHOD_VALUES[deliveryMethod], 10);
  }
  getStoreLocation() {
    return this.checkoutStateData.storeLocation;
  }

  getPaymentOptions() {
    return this.orderMetaData.data.paymentOption;
  }

  getPaymentMethod() {
    return this.orderMetaData.data?.paymentMethod;
  }

  getStripe() {
    return this.stripe;
  }

  getStripeError() {
    return this.stripeError;
  }

  getSquare() {
    return this.square;
  }

  getSquareNonce() {
    return this.squareNonce;
  }

  getSquareVerificationToken() {
    return this.squareVerificationToken;
  }

  getApplicableStoreRules() {
    return this.applicableStoreRules;
  }

  getApplicableFeeRules() {
    return this.applicableFeeRules;
  }


  // EOF: getters

  validCartLocation() {
    if (this.cartData.location && this.cartData.location !== -1) {
      return true;
    }
    return false;
  }
  validateCartLocation() {
    if (!this.validLocations && this.cartData.location && !this.orderMetaData) {
      return true;
    }
    return false;
  }
  getValidLocations() {
    return this.validLocations;
  }
  isValidLocation() {
    return (this.validLocations && this.validLocations.isValid);
  }

  isSettingsEnabled() {
    return 'yes';
  }

  showReadOnlyLocation() {
    if (   this.ifEnabledInStorePickup()
        && !this.ifOnlySelfPickup()
        && !this.ifOnlyDeliveryToAddress()
        && this.locationService.getUrlStoreLocation()
        && (this.getValidLocations() && this.getValidLocations().label === this.locationService.getUrlStoreLocation())) {
      return true;
    }
    return false;
  }

  showEditableLocation() {
    if ( this.ifEnabledInStorePickup() && (this.getPickupMethodAsInt() === 0 && this.showChoices())  ||
        (this.ifOnlyInStore() &&
          (!this.locationService.getUrlStoreLocation() ||
            (
              this.locationService.getUrlStoreLocation() &&
              this.getValidLocations() &&
              this.getValidLocations().label !== this.locationService.getUrlStoreLocation()
            )
          )
        )
      ) {
      return true;
    }
    return false;
  }

  showChoices() {
    if (this.ifOnlyInStore() || this.ifOnlySelfPickup() || this.ifOnlyDeliveryToAddress()) {
      return false;
    }
    if (  !this.showReadOnlyLocation()
        && this.ifEnabledMultiplePickupOptions()) {
      return true;
    }
    return false;
  }

  // atm we are actually not showing any delivery options if only self pickup is available
  showOnlySelfPickup() {
    if (!this.getStoreLocation() || !this.getLocationInitiallyPersisted() || !!this.cartData.location && this.ifOnlySelfPickup()) {
      return true;
    }
    return false;
  }

  // atmm we are actually not showing any delivery options if only delivery to address is available
  showOnlyDeliveryToAddress() {
    if (!this.getStoreLocation() || !this.getLocationInitiallyPersisted() || !!this.cartData.location && this.ifOnlyDeliveryToAddress()) {
      return true;
    }
    return false;
  }

  storeAvailabilitiesInDay(day) {
    if (!this.storeOpeningHours || !this.storeOpeningHours.schedule || !this.storeOpeningHours.schedule.availabilities) {
      return [];
    }
    return this.storeOpeningHours.schedule.availabilities.filter(a => !a.daysOfWeek || a.daysOfWeek.includes(day));
  }
  ifStoreClosed() {
    if (!this.storeOpeningHours) {
      return false;
    }

    const storeSchedulesForDay = this.storeAvailabilitiesInDay(dayjs().format('ddd').toUpperCase());
    return !storeSchedulesForDay.find(s => s.startTime <= dayjs().format('HH:mm:ss') && dayjs().format('HH:mm:ss') <= s.endTime);
  }

  ifEnabledOrder() {
    if (!this.selectedStore || !this.selectedStore.subscription || this.selectedStore.subscription.status === 'TRIAL_EXCEEDED') {
      return false;
    }

    if (this.selectedStore && this.selectedStore.settings && this.selectedStore.settings.ENABLE_ORDERING) {
      return this.selectedStore.settings.ENABLE_ORDERING;
    }

    return false;
  }

  ifNoDeliverySupported() {
    if (this.selectedStore
        && this.selectedStore.settings
        && !this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION
        && !this.selectedStore.settings.DELIVERY_NO_LOCATION
        && !this.selectedStore.settings.DELIVERY_ADDRESS) {
      return true;
    }
    return false;
  }
  ifNoDeliveryAvailable() {
    if (this.selectedStore
        && this.selectedStore.settings
        && !this.ifEnabledInStorePickup()
        && !this.ifEnabledSelfPickup()
        && !this.ifEnabledDeliveryAtAddress()) {
      return true;
    }
    return false;
  }

  ifOnlySelfPickup() {
    if (this.selectedStore
        && this.selectedStore.settings
        && !this.ifEnabledInStorePickup()
        && this.ifEnabledSelfPickup()
        && !this.ifEnabledDeliveryAtAddress()) {
      return true;
    }
    return false;
  }

  ifOnlyInStore() {
    if (this.selectedStore
        && this.selectedStore.settings
        && this.ifEnabledInStorePickup()
        && !this.ifEnabledSelfPickup()
        && !this.ifEnabledDeliveryAtAddress()) {
      return true;
    }
    return false;
  }

  ifOnlyDeliveryToAddress() {
    if (this.selectedStore
        && this.selectedStore.settings
        && !this.ifEnabledInStorePickup()
        && !this.ifEnabledSelfPickup()
        && this.ifEnabledDeliveryAtAddress()) {
      return true;
    }
    return false;
  }

  ifEnabledMultiplePickupOptions() {
    if (this.selectedStore && this.selectedStore.settings) {
      if (this.helperAtLeastTwo(this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION
        , this.selectedStore.settings.DELIVERY_NO_LOCATION
        , this.selectedStore.settings.DELIVERY_ADDRESS)) {
        return true;
      }
    }
    return false;
  }
  helperAtLeastTwo(a: boolean, b: boolean, c: boolean) {
      return a ? (b || c) : (b && c);
  }

  focusField(event) {
    const closestInput = this.closestInput(event.target);
    if (closestInput) {
      closestInput.focus();
    }
  }

  closestInput(target) {
    const expectedTypes = ['TEXTAREA', 'INPUT'];
    if (!target) {
      return null;
    }
    if (target && expectedTypes.includes(target.nodeName)) {
      return target;
    }
    if (!target.previousSibling && target.parentNode) {
      return this.closestInput(target.parentNode);
    }
    return this.closestInput(target.previousSibling);
  }

  /**
   * check if payment is enabled
   */
  ifEnabledPayment() {
    if ((this.selectedStore
        && this.selectedStore.settings
        && this.selectedStore.settings.PAYMENT_OPTION === 'disabled')
        || this.countEnabledPaymentMethods() === 0) {
      return false;
    }
    return true;
  }

  /**
   * check if payment is enabled and optional
   */
  ifEnabledPaymentSelection() {
    if (this.selectedStore
        && this.selectedStore.settings
        && this.selectedStore.settings.PAYMENT_OPTION === 'optional'
        && this.countEnabledPaymentMethods() !== 0) {
      return true;
    }
    return false;
  }

  /**
   * check if payment is enabled and mandatory
   */
  ifEnabledPaymentMandatory() {
    if (this.selectedStore
        && this.selectedStore.settings
        && this.selectedStore.settings.PAYMENT_OPTION === 'mandatory'
        && this.countEnabledPaymentMethods() !== 0) {
      // set payment option to pay now
      // this.setPaymentOption(1);
      return true;
    }
    return false;
  }

  /**
   * check if payment is enabled, optional & preselected
   */
  ifEnabledPaymentSelectionPreselected() {
    return (this.ifEnabledPaymentSelection() && this.selectedStore.settings.OPTIONAL_PAYMENT_PRESELECTED);
  }

  /**
   * count available payment methods
   */
  countEnabledPaymentMethods() {
    if (!this.selectedStore || !this.selectedStore.settings) {
      return 0;
    }
    const $this = this;
    let multiple = 0;
    Object.keys(PAYMENT_METHOD).forEach(method => {
      if ($this.selectedStore.settings[$this.getMethodKey(PAYMENT_METHOD[method])]) {
        multiple++;
      }
    });
    // Special case if JCC CREDIT CARD and STRIPE CREDIT CARD are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and RMS are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and PAYMENTSENSE are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and SQUARE are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      multiple--;
    }
    // Special case if JCC CREDIT CARD and VIVA are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.JCC)]) {
      return multiple;
    }
    // Special case if STRIPE CREDIT CARD and RMS are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)]
    ) {
      multiple--;
    }
    // Special case if STRIPE CREDIT CARD and PAYMENTSENSE are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      multiple--;
    }
    // Special case if STRIPE CREDIT CARD and SQUARE are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      multiple--;
    }
    // Special case if STRIPE CREDIT CARD and VIVA are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.STRIPE)]) {
      return multiple;
    }
    // Special case if RMS and PAYMENTSENSE are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      multiple--;
    }
    // Special case if RMS and SQUARE are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      multiple--;
    }
    // Special case if RMS and VIVA are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.RMS)]) {
      return multiple;
    }
    // Special case if PAYMENTSENSE CREDIT CARD and SQUARE are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      multiple--;
    }
    // Special case if PAYMENTSENSE CREDIT CARD and VIVA are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }
    if (this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]) {
      return multiple;
    }
    // Special case if SQUARE CREDIT CARD and VIVA are enabled then only SQUARE will be shown
    if (
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.SQUARE)] &&
      this.selectedStore.settings[this.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      multiple--;
    }

    return multiple;
  }

  /**
   * return the key for payment method
   * @param method int
   */
  getMethodKey(method) {
    switch (method) {
      case PAYMENT_METHOD.STRIPE:
        return 'PAYMENT_STRIPE_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.PAYPAL:
        return 'PAYMENT_PAYPAL_ENABLED';
      case PAYMENT_METHOD.IDEAL:
        return 'PAYMENT_STRIPE_IDEAL_ENABLED';
      case PAYMENT_METHOD.BANCONTACT:
        return 'PAYMENT_STRIPE_BANCONTACT_ENABLED';
      case PAYMENT_METHOD.SQUARE:
        return 'PAYMENT_SQUARE_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.VIVA:
        return 'PAYMENT_VIVA_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.DIGITAL_WALLETS:
        return 'PAYMENT_STRIPE_DIGITAL_WALLETS_ENABLED';
      case PAYMENT_METHOD.PAYMENTSENSE:
        return 'PAYMENT_PAYMENTSENSE_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.RMS:
        return 'PAYMENT_RMS_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.JCC:
        return 'PAYMENT_JCC_CREDIT_CARD_ENABLED';
      case PAYMENT_METHOD.TRUSTPAYMENTS:
        return 'PAYMENT_TRUSTPAYMENTS_CREDIT_CARD_ENABLED';
      default:
        return null;
    }
  }

  /**
   * If delivery-in-store-location = false AND delivery-no-location = true
   * location pickup is disabled
   */
  ifEnabledInStorePickup() {
    if (!this.selectedStore || !this.selectedStore.settings || !this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION) {
      return false;
    }
    if (this.ifStoreClosed() && !this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_CHOOSE_FUTURE_ORDER_DATE) {
      return false;
    }
    return true;
  }
  ifEnabledSelfPickup() {
    if (!this.selectedStore || !this.selectedStore.settings || !this.selectedStore.settings.DELIVERY_NO_LOCATION) {
      return false;
    }
    if (this.ifStoreClosed() && !this.selectedStore.settings.DELIVERY_NO_LOCATION_CHOOSE_FUTURE_ORDER_DATE) {
      return false;
    }
    return true;
  }
  ifEnabledDeliveryAtAddress() {
    if (!this.selectedStore || !this.selectedStore.settings || !this.selectedStore.settings.DELIVERY_ADDRESS) {
      return false;
    }
    if (this.ifStoreClosed() && !this.selectedStore.settings.DELIVERY_ADDRESS_CHOOSE_FUTURE_ORDER_DATE) {
      return false;
    }
    return true;
  }
  ifDeliveryMethodEnabled(deliveryMethod: string) {
    if (this.selectedStore && this.selectedStore.settings) {
      switch (deliveryMethod) {
        case 'IN_STORE_LOCATION':
          return this.ifEnabledInStorePickup();
        case 'NO_LOCATION':
          return this.ifEnabledSelfPickup();
        case 'ADDRESS':
          return this.ifEnabledDeliveryAtAddress();
      }
    }
    return false;
  }
  ifCollapsableDisabled() {
    if (this.showChoices() && (isNaN(this.getPickupMethodAsInt()) || this.getPickupMethodAsInt() === -1)) {
      return true;
    }
    return false;
  }
  ifMinimumOrderAmountMet(type = '') {
    if (!this.selectedStore || !this.cartItems || this.cartItems.length === 0) {
      return true;
    }
    if (this.getOrderMinAmountDelivery() === 0) {
      return true;
    }
    const cartTotal = this.getCartTotal(true);
    switch (type) {
      case 'onlyDelivery':
        if (this.ifOnlyDeliveryToAddress()
            && this.getOrderMinAmountDelivery() > cartTotal) {
            return false;
        }
        break;
      case 'deliveryAsOption':
        if ((this.showChoices() && this.ifEnabledDeliveryAtAddress())
            && this.getOrderMinAmountDelivery() > cartTotal) {
            return false;
        }
        break;
      default:
        if ((this.ifOnlyDeliveryToAddress()
            || (this.showChoices() && this.ifEnabledDeliveryAtAddress() && this.getPickupMethodAsInt() === 2))
            && this.getOrderMinAmountDelivery() > cartTotal) {
            return false;
        }
        break;
    }
    return true;
  }

  getZoneRestrictions() {
    if (this.selectedStore.settings.DELIVERY_ZONE_RESTRICTION) {
      return true;
    }
    return false;
  }

  isNotDeliverableAddress() {
    if (this.getZoneRestrictions() && this.zoneStateData.status === 'NOTDELIVERABLE_ADDRESS') {
      return true;
    }
    return false;
  }

  isNotDeliverablePostCode() {
    if (this.getZoneRestrictions() && this.zoneStateData.status === 'NOTDELIVERABLE_POSTCODE') {
      return true;
    }
    return false;
  }

  isDeliverable() {
    if (this.getZoneRestrictions() && this.zoneStateData.status === 'DELIVERABLE') {
      return true;
    }
    return false;
  }

  getOrderMinAmountDelivery() {
    if (this.zoneStateData && this.zoneStateData.status === 'DELIVERABLE' && this.zoneStateData.settings?.orderMinAmountDelivery) {
      return this.zoneStateData.settings.orderMinAmountDelivery;
    }
    return this.selectedStore.orderMinAmountDelivery;
  }

  getOrderFreeDelivery() {
    if (this.zoneStateData && this.zoneStateData.status === 'DELIVERABLE' && this.zoneStateData.settings.orderAmountFreeDelivery) {
      return this.zoneStateData.settings.orderAmountFreeDelivery;
    }
    return this.selectedStore.orderAmountFreeDelivery;
  }

  getOrderFeeDelivery() {
    return this.cartData.deliveryFee;
  }

  /**
   * get the UUID for a store promotion rule added to the cart
   * @param offerId string - id for the offer we want to check if it is a part of store promotion rule
   */
  getOfferRuleUuid(offerId: number) {
    let ret = '';

    if (!this.cartItems) {
      return ret;
    }
    this.cartItems.map(cartItem => {
      if (cartItem.offerId === offerId) {
        ret = cartItem.uuid;
      }
    });

    return ret;
  }

  isRuleValid(ruleIndex) {
    if (this.applicableStoreRules[ruleIndex]) {
      let allConditionsAreTrue = true;
      this.applicableStoreRules[ruleIndex].conditions.forEach(condition => {
        switch (condition.type) {
          case 'ORDER_AMOUNT_RANGE':
            if (this.getCartTotal(true) < condition.data.min
              || this.getCartTotal(true) > condition.data.max) {
              allConditionsAreTrue = false;
            }
            break;
          case 'DELIVERY_MODE':
            if (this.getPickupMethodStr() !== condition.data.deliveryMode) {
              allConditionsAreTrue = false;
            }
            break;
          default:
            // do nothing
            break;
        }
      });
      if (allConditionsAreTrue) {
        // the condition is still valid
        return true;
      }
    }
    // the condition is NO LONGER valid. DO NOT ADD TO CART!
    return false;
  }

  hasStoreRuleOffers() {
    if (!this.checkoutStateData.storeRuleFormValid || !this.checkoutStateData.feeRuleFormValid) {
      // I should not be able to get to this point if the storeRuleForm is invalid
      this.store.dispatch(new ErrorMessage('public.global.errorExpected', '501'));
    }
    if (!this.checkoutStateData.storeRuleOffers) {
      return false;
    }
    // update store offer rules - as some rules may have expired
    const validStoreRulesAtCheckout = [];
    this.checkoutStateData.storeRuleOffers.forEach(offer => {
      if (this.storeRules[offer.ruleIndex] && this.isRuleValid(offer.ruleIndex)) {
        validStoreRulesAtCheckout.push(offer);
      }
    });
    this.store.dispatch(new AddCheckoutState('storeRuleOffers', validStoreRulesAtCheckout));
    if (validStoreRulesAtCheckout.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * check if the offer is part of a store promotion rule
   * @param offerId string - id for the offer we want to check if it is a part of store promotion rule
   */
  ifOfferRule(offerId: number) {
    let ret = false;
    this.storeRules.map(rule => {
      rule.actions.map(action => {
        if (action.data.offers) {
          action.data.offers.map(offer => {
            if (offer.offerId === offerId) { ret = true; }
          });
        }
      });
    });
    return ret;
  }

  /**
   * check if the offer is added to cart
   * usually used to determine if a store promotion
   * rule offer is already added to cart
   * @param offerId string - id for the offer we want to check if it is a part of cart items
   */
  ifCartOfferRule(offerId: number) {
    let ret = false;
    if (!this.cartItems) {
      return;
    }
    this.cartItems.map(orderItem => {
      if (orderItem.offerId === offerId) {
        ret = true;
      }
    });
    return ret;
  }

  /**
   * check if the offer is added to cart
   * usually used to determine if a store promotion
   * rule offer is already added to cart
   * @param offerId string - id for the offer we want to check if it is a part of cart items
   */
  ifCartOfferRuleMinZeroMaxOne(offerId: number) {
    let ret = false;
    const rules = this.getApplicableStoreRules();
    rules.map(rule => {
      rule.actions.map(action => {
        if (action.data
            && action.data.min !== undefined && action.data.min === 0
            && action.data.max !== undefined && action.data.max === 1) {
          action.data.offers.map(offer => {
            if (offer.offerId === offerId) {
              ret = true;
            }
          });
        }
      });
    });

    return ret;
  }

  /**
   * for now we are depercating this mechanism of adding offer rules on submission
   * we will add/persist them on select directly to the order/be
   */
  submitStoreRuleOffers() {
    if (!this.checkoutStateData.storeRuleFormValid || !this.checkoutStateData.feeRuleFormValid) {
      // I should not be able to get to this point if the storeRuleForm is invalid
      this.store.dispatch(new ErrorMessage('public.global.errorExpected', '501'));
    }
    if (!this.checkoutStateData.storeRuleOffers) {
      return;
    }
    const payload = [];
    this.checkoutStateData.storeRuleOffers.forEach(offer => {
      if (this.storeRules[offer.ruleIndex] && this.isRuleValid(offer.ruleIndex)) {
        const offerItem = {
          offerId: offer.offerId,
          quantity: offer.quantity,
          comment: ''
        };
        payload.push(offerItem);
        // at the moment it is assumed that only one order item would be added to cart
        // if that isn't the case this will present an issue
        this.store.dispatch(new AddRuleOrderItem(this.selectedStore.id, this.orderUuid, offerItem));
      }
    });
  }

  ifSubmitOrderReady(isAdminOrderUpdate?: boolean) {
    // true if: invalid payment method is selected or checkout options form is invalid
    if (this.OrderBtnDisabled)  {
      return false;
    }
    // true if: store rules are enabled and there is a required selection which has not been made
    if (!this.checkoutStateData.storeRuleFormValid || !this.checkoutStateData.feeRuleFormValid) {
      return false;
    }
    if (!this.checkoutStateData.voucherFormValid) {
      return false;
    }
    // true if: minimum order amount is met and delivery at address is enabled/available
    if (!this.ifMinimumOrderAmountMet())  {
      return false;
    }
    // true if: valid wishtime is provided.
    // a valid wishtime is considered:
    // no wish time selection at all,
    // I want to receive ASAP, or
    // valid timepicker value provided when want to specify it
    if (
      !isAdminOrderUpdate &&
      this.isCheckoutMetaData('timeSelectionValid') &&
      !this.getCheckoutMetaDataValue('timeSelectionValid')
    ) {
      return false;
    }
    if (
      !isAdminOrderUpdate &&
      this.getPickupMethodAsInt() === PICKUP_METHOD.AT_ADDRESS
      &&  this.getZoneRestrictions()
      && !this.isDeliverable()) {
      return false;
    }
    if (
      !isAdminOrderUpdate &&
      (this.ifOnlyInStore() || this.getPickupMethodAsInt() === 0) &&
      !this.isValidLocation()
    ) {
      return false;
    }
    if (
      (
        isAdminOrderUpdate ||
        (
          !this.isPaymentComponent() ||
          (this.isPaymentComponent() && this.isPaymentValid())
        )
      ) &&
      this.checkoutStateData.personalFormValid
    ) {
      return true;
    }
    return false;
  }

  isPaymentComponent() {
    return ((this.ifEnabledPaymentSelection() || this.ifEnabledPaymentMandatory()) && this.cartData.totalDiscountedPrice > 0);
  }

  isPaymentValid() {
    if (
      !this.ifEnabledPayment() ||
      (
        this.ifEnabledPaymentMandatory() &&
        (this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.STRIPE || this.getOrderMetaData('paymentMethod') === '') &&
        this.stripe &&
        !this.stripeError
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.IDEAL &&
        this.stripe &&
        !this.stripeError
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.DIGITAL_WALLETS &&
        this.stripe
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.BANCONTACT
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.SQUARE &&
        this.square &&
        !this.squareError
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.VIVA &&
        !this.vivaError
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.PAYMENTSENSE &&
        !this.paymentSenseError
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.RMS
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.TRUSTPAYMENTS
      ) ||
      (
        this.ifEnabledPaymentMandatory() &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.JCC
      ) ||
      (
        this.ifEnabledPaymentSelection() && (this.getOrderMetaData('paymentOption') === 0 ||
        this.getOrderMetaData('paymentOption') === '')
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        (
          this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.STRIPE ||
          this.getOrderMetaData('paymentMethod') === ''
        ) &&
        this.stripe &&
        !this.stripeError
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.PAYPAL
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.IDEAL &&
        !!this.stripe &&
        !this.stripeError
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.DIGITAL_WALLETS &&
        this.stripe
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.BANCONTACT
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.SQUARE &&
        this.square &&
        !this.squareError
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.VIVA &&
        !this.vivaError
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.PAYMENTSENSE &&
        !this.paymentSenseError
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.RMS
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.TRUSTPAYMENTS
      ) ||
      (
        this.ifEnabledPaymentSelection() &&
        this.getOrderMetaData('paymentOption') > 0 &&
        this.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.JCC
      )
    ) {
      return true;
    }
    return false;
  }

  squareApplicationId() {
    return this.selectedStore.settings.SQUARE_APPLICATION_ID;
  }

  squareLocationId() {
    return this.selectedStore.settings.SQUARE_LOCATION_ID;
  }

  requestSquareNonce() {
    return this.square.requestCardNonce();
  }

  cleanup() {
    this.square = null;
    this.squareNonce = null;
    this.squareError = true;
    this.vivaError = true;
  }

  isTimeShowDisabled() {
    if (!this.selectedStore || !this.selectedStore.settings) {
      return false;
    }
    switch (this.getPickupMethodStr()) {
      case 'IN_STORE_LOCATION':
        return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_HIDE_FUTURE_WISH_DATE;
      case 'NO_LOCATION':
        return this.selectedStore.settings.DELIVERY_NO_LOCATION_HIDE_FUTURE_WISH_DATE;
      case 'ADDRESS':
        return this.selectedStore.settings.DELIVERY_ADDRESS_HIDE_FUTURE_WISH_DATE;
    }
    return false;
  }

  isFutureOrderingEnabled(){
    return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_CHOOSE_FUTURE_ORDER_DATE
          || this.selectedStore.settings.DELIVERY_NO_LOCATION_CHOOSE_FUTURE_ORDER_DATE
          || this.selectedStore.settings.DELIVERY_ADDRESS_CHOOSE_FUTURE_ORDER_DATE;
  }

  isShowParentItemPrice(orderItem: OrderItem) {

    if (orderItem.quantity > 1
      || (orderItem.discountValue !== undefined
        && orderItem.discountValue !== 0)) {
      return true;
    }
    if (orderItem.childOrderItems !== undefined
      && orderItem.childOrderItems.length > 0) {
      let found = false;
      orderItem.childOrderItems.forEach(childOrderItem => {
        if (childOrderItem.offerPrice !== undefined && childOrderItem.offerPrice !== 0) {
          found = true;
        }
      });
      return found;
    }
    return false;
  }
}
