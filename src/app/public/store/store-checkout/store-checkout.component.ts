import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Inject, HostListener, AfterViewInit, Renderer2 } from '@angular/core';
import { ClientStore, OrderItem, Order, LocationValid } from 'src/app/stores/stores';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subject, combineLatest, timer, of } from 'rxjs';
import { Cart, CatalogList, OrderMetaState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import {
  getSelectedStore,
  getSelectedStoreCatalog,
  getCurrentOrderMetaState,
  getCurrentCartUuid,
  getSelectedLang,
  getStoreLocationsState,
  getCurrentCartState,
  getCurrentCartStatus,
  getSelectedCategoryState
} from '../+state/stores.selectors';
import { filter, take, takeUntil } from 'rxjs/operators';
import { LocationService } from '../../location.service';
import {
  OrderUpdateStatus,
  ErrorMessage,
  ClearOrderMeta,
  SubmitOrder,
  ClearCheckoutState,
  CheckExistingOrder,
  UpdateOrderItem,
  RemoveOrderItem,
  OrderUpdateSuccess,
} from '../+state/stores.actions';
import { StoreCheckoutPaymentComponent } from './store-checkout-payment/store-checkout-payment.component';
import { CheckoutService, PAYMENT_OPTION, PAYMENT_METHOD, PICKUP_METHOD } from './checkout.service';
import { WINDOW } from '../../window-providers';
import { StoreCheckoutYourInformationComponent } from './store-checkout-your-information/store-checkout-your-information.component';
import { DOCUMENT } from '@angular/common';
import { HelperService } from '../../helper.service';
import { StoreCheckoutDeliveryComponent } from './store-checkout-delivery/store-checkout-delivery.component';
import { StoreCheckoutOrderWishTimePanelComponent } from './store-checkout-order-wish-time-panel/store-checkout-order-wish-time-panel.component';
import OrderUtils from '../utils/OrderUtils';
import { DELIVERY_METHODS } from '../types/DeliveryMethod';
import dayjs from 'dayjs';
import { StoreService } from '../store.service';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PaymentMethod } from '../types/PaymentMethod';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Component({
  selector: 'app-store-checkout',
  templateUrl: './store-checkout.component.html',
  styleUrls: ['./store-checkout.component.scss']
})
export class StoreCheckoutComponent implements OnInit, OnDestroy, AfterViewInit {

  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;

  cartItems: OrderItem[];
  catalog$: Observable<CatalogList>;
  catalog: CatalogList;
  selectedCatalog: number;
  orderMetaData: OrderMetaState;
  orderUuid: string;
  currentCartUuid: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  selectedLang: string;
  cartData: Order;
  cartStatus: string;
  cartStatus$: Observable<string>;
  storeLocation: string | number;
  selectedPickupMethod: number;
  // selectedPaymentOption: number;  // id of payment method: -1 - undefined; 0 - pay later; 1 - pay now
  // selectedPaymentMethod: number;  // id of payment method: -1 - undefined; 0 - I will pay in store; 1 - I will pay online
  validLocations: LocationValid = null;
  totalPricePos = 0;
  showTotalInButton = false;
  showStickyScroll: boolean;
  pageHeight: number;
  addToCartDisabled: boolean;
  PAYMENT_OPTION = PAYMENT_OPTION;
  PAYMENT_METHOD = PAYMENT_METHOD;
  PICKUP_METHOD = PICKUP_METHOD;
  backToCurrentCat: number;
  isPos = false;
  isAdminOrderUpdate = true;
  innerHeight = 500;
  currentPopUpFrom: string;
  isPaymentStarted = false;
  loggedInUserId: number;

  @ViewChild(StoreCheckoutPaymentComponent) paymentComponent: StoreCheckoutPaymentComponent;
  @ViewChild(StoreCheckoutYourInformationComponent) yourInformationComponent: any;
  @ViewChild(StoreCheckoutDeliveryComponent) checkoutDelivery: any;
  @ViewChild(StoreCheckoutOrderWishTimePanelComponent) wishTimeComponent: StoreCheckoutOrderWishTimePanelComponent;
  @ViewChild('totalOrderPrice') totalOrderPrice: ElementRef;
  @ViewChild('scrollableContaner') scrollableContaner: ElementRef;
  @ViewChild('readMoreSelectorModal') readMoreModal: ElementRef;
  @HostListener('window:resize', ['$event'])
  // @HostListener('window:scroll', ['$event'])
  onResize(event) {
    this.scrollCalc();
  }

  constructor(
    private store: Store<Cart>,
    private router: Router,
    private locationService: LocationService,
    public checkoutService: CheckoutService,
    private storeService: StoreService,
    private helper: HelperService,
    private renderer: Renderer2,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: any,
  ) {
    this.innerHeight = this.helper.calcInnerHeight();
  }

  ngOnInit() {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    this.addToCartDisabled = true;
    this.storeLocation = this.locationService.getStoreLocation();
    const calc = timer(20);
    calc.subscribe(_ => { this.scrollCalc(); });
    // this.checkoutService.paymentComponent = this.paymentComponent;

    this.store.select(getSelectedCategoryState)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(value => {
          if (value && value.currentCategoryState) {
            this.backToCurrentCat = value.currentCategoryState.selectedCategory;
          }
    });

    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.selectedStore$
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(value => {
            this.selectedStore = value;
            // if (this.selectedStore && this.selectedStore.address && this.selectedStore.currency) {
            //   this.selectedStoreLocale = this.selectedStore.address.country.defaultLocale
            //                             + '-'
            //                             + this.selectedStore.address.country.code;
            //   this.selectedStoreCurrency = this.selectedStore.currency.isoCode;
            //   this.selectedStoreCurrencySymbol = this.selectedStore.currency.symbol;
            // }
          });

    this.catalog$ = this.store.pipe(
      select(getSelectedStoreCatalog)
    );
    this.catalog$
        .pipe(
          takeUntil(this.unsubscribe$),
          filter(c => c.data.catalogId !== -1)
        )
        .subscribe(state => {
          this.selectedCatalog = state.data.catalogId;
          this.catalog = state;
    });

    this.store.select(getSelectedLang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(value => {
          this.selectedLang = value;
    });

    combineLatest([
          this.selectedStore$
        , this.store.select(getCurrentCartUuid)
        , this.store.select(getCurrentCartState)
        , this.store.select(getStoreLocationsState)
        , this.store.select(getCurrentOrderMetaState)
    ]).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state[0]) {
          this.selectedStore = state[0];
        }
        if (state && state[1]) {
          this.orderUuid = state[1];
        }
        if (state && state[2]) {
          this.cartData = state[2];
          const hierarchyLevelToInt = {
            PARENT: 0,
            RULE: 1,
            RULE_DELIVERY_FEE: 2,
          };
          const orderItems = this.cartData.orderItems;
          this.cartItems = (!!orderItems && orderItems.length > 0) ? orderItems.sort((a, b) => {
            const aLevel = a.hierarchyLevel ? hierarchyLevelToInt[a.hierarchyLevel] : 3;
            const bLevel = b.hierarchyLevel ? hierarchyLevelToInt[b.hierarchyLevel] : 3;
            return aLevel - bLevel;
          }) : [];
        }
        if (state && state[0] && this.orderUuid && this.cartData) {
          if (
            this.cartData.status && this.cartData.status !== 'SUBMITTED' &&
            (
              !this.cartData.orderItems ||
              (
                this.cartData.orderItems &&
                this.cartData.orderItems.length === 0
              )
            )
          ) {
            this.router.navigateByUrl(this.locationService.base_url('emptycart'));
          }
        }
        if (state[4]) {
          this.orderMetaData = state[4];
          if (this.orderMetaData.data.deliveryMethod) {
            this.selectedPickupMethod = parseInt(this.orderMetaData.data.deliveryMethod, 10);
          }
        }
      });

    this.cartStatus$ = this.store.select(getCurrentCartStatus);
    this.cartStatus$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((status) => {
        this.cartStatus = status;
        if (status === 'ITEMUPDATED' || status === 'ITEMREMOVED') {
          this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.orderUuid, 'CHECKEXISTING', this.selectedLang));
        }
      });
    combineLatest([this.store.select(getCurrentCartStatus), this.store.select(getCurrentCartState)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state[0]) {
          case 'FINISHED_ONLINE_PAYMENT':
            this.isPaymentStarted = false;
            // 28.09.2020 the meta data will be always persisted prior to initiating online payment
            // this.parseMetaData();

            // For payments without redirect cleanup after successful completion and navigate
            this.cleanup();
            this.router.navigateByUrl(`${this.locationService.public_url()}#thankyou/e/${this.cartData.uuid}`);
            break;
          case 'INIT_ONLINE_PAYMENT':
            this.isPaymentStarted = true;
            // 29.09.2020 initialize online payment process on ENTER key submission
            // 05.11.2020 directly parse meta data only if there are no store rule offers,
            // otherwise wait for them to complete first:
            if (!this.checkoutService.hasStoreRuleOffers()) {
              this.parseMetaData();
            } else {
              // check if there are store rule offers that need to be added to cart and add them:
              // this.checkoutService.submitStoreRuleOffers();
            }
            break;
          case 'RULE_OFFERS_ADDED':
            // 28.01.2021 when rule offers are added we no longer submit the order, but refresh the cart content
            // 05.11.2020 once rule offers are added re-parse meta data
            // this.parseMetaData();
            // fetch new order content:
            this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.orderUuid, 'CHECKEXISTING', this.selectedLang));
            break;
          case 'RULE_OFFERS_REMOVED':
              // fetch new order content:
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.orderUuid, 'CHECKEXISTING', this.selectedLang));
              break;
          case 'ORDERSUBMITTED': {
            this.isPaymentStarted = false;
            const selectedPaymentMethod = this.checkoutService.getPaymentMethod();
            const selectedPaymentOption = this.checkoutService.getPaymentOptions();
            // change order status manually only if payment method is "I will pay later"
            if (
              typeof(selectedPaymentMethod) === 'undefined' ||
              selectedPaymentMethod === PAYMENT_METHOD.UNDEFINED
            ) {
              if (this.isAdminOrderUpdate) {
                this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.orderUuid));
                this.router.navigateByUrl(`/manager/stores/${this.selectedStore.id}/orders/${this.cartData.uuid}`);
              } else {
                this.cleanup();
                this.router.navigateByUrl(`${this.locationService.public_url()}#thankyou/e/${this.cartData.uuid}`);
              }
            }

            if (selectedPaymentOption === PAYMENT_OPTION.PAY_NOW
                && (selectedPaymentMethod === PAYMENT_METHOD.IDEAL || selectedPaymentMethod === PAYMENT_METHOD.BANCONTACT)) {
              // do nothing: redirect to thank you only if not iDeal nor Bancontact payment
              // For payments with redirect cleanup now
              this.cleanup();
            }

            if (selectedPaymentOption === PAYMENT_OPTION.PAY_NOW) {
              if (selectedPaymentOption === 1) {
                switch (selectedPaymentMethod) {
                  case PAYMENT_METHOD.STRIPE:
                    // credit card payment selected
                    // nothing to do but persist the data
                    // payment will be handled on BE side and payment to Stripe is already initiated
                    // 28.09.2020 stripe card payments are now also made only after order detaisl have been persisted
                    this.paymentSubmit();
                    break;
                  case PAYMENT_METHOD.PAYPAL:
                    // TODO: paypal payment selected
                    // this.store.dispatch(new AddOrderMeta('paymentMethod', PaymentMethod.PAYPAL));
                    // obtain paypal access token
                    // disable paypal until we are ready
                    // this.store.dispatch(new ObtainToken());
                    break;
                  case PAYMENT_METHOD.IDEAL:
                    // iDeal payment selected
                    // order data is persisted above, simply initiate the payment with redirect
                    this.paymentSubmit();
                    break;
                  case PAYMENT_METHOD.BANCONTACT:
                    // // Bancontact payment selected
                    // // order data is persisted above, simply initiate the payment with redirect
                    this.paymentSubmit();
                    break;
                  case PAYMENT_METHOD.SQUARE:
                    this.checkoutService.requestSquareNonce();
                    break;
                  case PAYMENT_METHOD.VIVA:
                    this.paymentSubmit();
                    break;
                  case PAYMENT_METHOD.DIGITAL_WALLETS:
                    this.paymentComponent.completeDigitalWalletsPaymentFlow();
                    break;
                  case PAYMENT_METHOD.PAYMENTSENSE:
                    this.paymentSubmit();
                    break;
                  case PAYMENT_METHOD.RMS:
                    this.paymentSubmit();
                    break;
                  case PAYMENT_METHOD.JCC:
                    this.paymentSubmit();
                    break;
                  case PAYMENT_METHOD.TRUSTPAYMENTS:
                    this.paymentSubmit();
                    break;
                }
              }
            }
            break;
          }
          case 'ORDERSUBMITFAILED': {
            const selectedPaymentMethod = this.checkoutService.getPaymentMethod();
            const selectedPaymentOption = this.checkoutService.getPaymentOptions();

            if (selectedPaymentOption === PAYMENT_OPTION.PAY_NOW) {
              if (selectedPaymentOption === 1) {

                if (selectedPaymentOption === PAYMENT_OPTION.PAY_NOW) {
                  if (selectedPaymentOption === 1) {
                    switch (selectedPaymentMethod) {
                      case PAYMENT_METHOD.DIGITAL_WALLETS:
                        // In case of digital wallets payment, abort the payment selection popup in case of error
                        // Note we pass in 'success' in the complete method here, cause otherwise the browser will not close the popup
                        this.paymentComponent.paymentMethodStripe.complete('success');
                        break;
                    }
                  }
                }
              }
            }
            this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.orderUuid, 'CHECKEXISTING', this.selectedLang));
            break;
          }
          case 'ORDERUPDATEFAILED':
            this.store.dispatch(new ErrorMessage('public.checkout.errors.couldNotWriteOrderDetails'));
            break;
          default:
            break;
        }
        (window as any).isPaymentStarted = this.isPaymentStarted;
      });

    // window.addEventListener('scroll', this.scroll, true);
    this.isPos = this.router.url.includes('/capture/');
    this.isAdminOrderUpdate = this.locationService.isAdminOrderUpdate();

    this.router.events
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: NavigationStart) => {
        if (event.navigationTrigger === 'popstate' && this.isPaymentStarted) {// Prevent go back only if payment starts
          this.router.navigateByUrl(this.locationService.base_url('cart'));
        }
      });

    this.store.select(getLoggedInUser)
      .subscribe(loggedInUser => {
        if (loggedInUser.id !== -1){
          this.loggedInUserId = loggedInUser.id;
        }
      });

  } // EOF NGINIT

  ngAfterViewInit() {
    this.helper.scrollTo(0, 700, this.scrollableContaner);
  }

  private cleanup() {
    // clear order meta
    if (this.checkoutService.getValidLocations()) {
      this.store.dispatch(new ClearOrderMeta({
        location: this.checkoutService.getValidLocations().label,
        paymentOption: this.checkoutService.getPaymentOptions()
      }));
    } else {
      this.store.dispatch(new ClearOrderMeta({paymentOption: this.checkoutService.getPaymentOptions()}));
    }
    // clear checkout meta
    this.store.dispatch(new ClearCheckoutState());
    this.checkoutService.cleanup();
  }

  onGoBack(event) {
    event.preventDefault();
    // this.locationService.goBack();
    let backUrl = '';
    if (this.backToCurrentCat) {
      backUrl = `category/${this.backToCurrentCat}`;
    }
    this.router.navigateByUrl(this.locationService.base_url(backUrl));
  }

  viewProductDetails(orderUuid, offerId) {
    // check if the orderUuid is in fact a store promo rule
    // if yes, then do nothing
    if (this.checkoutService.ifOfferRule(offerId)) {
      return;
    }
    this.router.navigateByUrl(this.locationService.base_url(`orderItem/${orderUuid}`));
  }

  onSelectPickupMethod(method) {
    this.addToCartDisabled = false;
  }

  getChildOfferPrice(childOfferItems) {
    return childOfferItems.filter(({offerPrice}) => offerPrice).reduce((price, orderItem) => price + orderItem.offerPrice, 0) > 0;
  }

  itemTotalNonDiscountedValue(item) {
    // const qty = item.quantity;
    // let ret = item.totalNonDiscountedPrice;
    // if (item.childOrderItems) {
    //   ret += item.childOrderItems.filter(({offerPrice}) => offerPrice).reduce((price, orderItem) =>
    //                                                                            price + (qty * orderItem.offerPrice), 0);
    // }
    // return ret;
    return item.totalNonDiscountedPrice;
  }

  // as per Skype discussion (02.04.2020) BE is sending calculated totalDiscountedPrice and totalNonDiscountedPrice
  // for the WHOLE ORDER ITEM so no need to add on the price and qty for child order items
  itemTotalDiscountedValue(item) {
    // const qty = item.quantity;
    // let ret = item.totalDiscountedPrice;
    // if (item.childOrderItems) {
    //   ret += item.childOrderItems.filter(({offerPrice}) => offerPrice).reduce((price, orderItem) =>
    //                                                                             price + (qty * orderItem.offerPrice), 0);
    // }
    // return ret;
    return item.totalDiscountedPrice;
  }

  /**
   * MOVED!!!
   * from payment component
   */

  onToggleExpandContent($event) {
    if (!$event.target.classList.contains('disabled')) {
      $event.target.classList.toggle('expanded');
      $event.target.nextSibling.classList.toggle('collapsed');
    }
  }

  // parse the metadata
  parseMetaData() {
    const orderMeta = this.checkoutService.orderMetaData.data;
    const obj = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
      orderMeta,
      this.selectedStore,
      this.checkoutService.validLocations,
      this.selectedLang,
    );
    obj.validateOrder = true;
    // add device id
    const deviceIdentifier = this.helper.getDeviceID();
    obj.deviceIdentifier = deviceIdentifier;

    // For no payment orders submit the order
    const selectedPaymentMethod = this.checkoutService.getPaymentMethod();

    if (typeof (selectedPaymentMethod) === 'undefined'
      || selectedPaymentMethod === PAYMENT_METHOD.UNDEFINED) {
      obj.status = 'SUBMITTED';
      if (orderMeta.tapId) {
        obj.tapId = orderMeta.tapId;
      }
      obj.customerUserId = this.loggedInUserId;
      this.store.dispatch(new SubmitOrder(this.checkoutService.selectedStore.id, this.checkoutService.orderUuid, obj, true));
    } else {
      // update order details
      switch (orderMeta.paymentMethod) {
        case PAYMENT_METHOD.DIGITAL_WALLETS:
          obj.paymentMethod = (!!this.checkoutService.getSelectedDigitalPaymentMethod()) ?
            this.checkoutService.getSelectedDigitalPaymentMethod() : PaymentMethod.DIGITAL_WALLET_STRIPE;
          break;
        case PAYMENT_METHOD.STRIPE:
          obj.paymentMethod = PaymentMethod.CREDIT_CARD_STRIPE;
          break;
        case PAYMENT_METHOD.PAYPAL:
          obj.paymentMethod = PaymentMethod.PAYPAL;
          break;
        case PAYMENT_METHOD.IDEAL:
          obj.paymentMethod = PaymentMethod.IDEAL;
          break;
        case PAYMENT_METHOD.BANCONTACT:
          obj.paymentMethod = PaymentMethod.BANCONTACT;
          break;
        case PAYMENT_METHOD.SQUARE:
          obj.paymentMethod = PaymentMethod.CREDIT_CARD_SQUARE;
          break;
        case PAYMENT_METHOD.VIVA:
          obj.paymentMethod = PaymentMethod.CREDIT_CARD_VIVA;
          break;
        case PAYMENT_METHOD.PAYMENTSENSE:
          obj.paymentMethod = PaymentMethod.CREDIT_CARD_PAYMENTSENSE;
          break;
        case PAYMENT_METHOD.RMS:
          obj.paymentMethod = PaymentMethod.CREDIT_CARD_RMS;
          break;
        case PAYMENT_METHOD.TRUSTPAYMENTS:
          obj.paymentMethod = PaymentMethod.CREDIT_CARD_TRUSTPAYMENTS;
          break;
        case PAYMENT_METHOD.JCC:
          obj.paymentMethod = PaymentMethod.CREDIT_CARD_JCC;
      }
      this.store.dispatch(new SubmitOrder(this.checkoutService.selectedStore.id, this.checkoutService.orderUuid, obj));
    }

  }

  // submit the order
  OnSubmitOrder(event) {
    event.preventDefault();
    if (!this.checkoutService.ifSubmitOrderReady(this.isAdminOrderUpdate)) {
      // btn is disabled
      return;
    }
    if (this.selectedStore && this.cartData) {
      // parse the order Meta Data
      // 28.09.2020 order meta data should always be persisted prior to payment
      // 05.11.2020 directly parse meta data only if there are no store rule offers,
      // otherwise wait for them to complete first:
      if (!this.checkoutService.hasStoreRuleOffers()) {
        if (!!this.wishTimeComponent &&
          !!this.wishTimeComponent.getControl('wishOrderDeliveryTime') &&
          this.wishTimeComponent.getControl('wishOrderDeliveryTime').value === '0') {
          this.getLatestSlotAvailable();
        } else {
          this.parseMetaData();
        }
      } else {
        // check if there are store rule offers that need to be added to cart and add them:
        // this.checkoutService.submitStoreRuleOffers();
      }
    }
  }

  getLatestSlotAvailable() {
    if (!!this.checkoutService.orderMetaData &&
      !!this.checkoutService.orderMetaData.data &&
      !!this.checkoutService.orderMetaData.data.deliveryMethod &&
      !!this.checkoutService.orderMetaData.data.wishTime &&
      dayjs(this.checkoutService.orderMetaData.data.wishTime).isBefore(dayjs())) {
      this.storeService.getSlots(
        this.selectedStore.id,
        DELIVERY_METHODS[this.checkoutService.orderMetaData.data.deliveryMethod],
        dayjs(this.checkoutService.orderMetaData.data.wishTime).format('YYYY-MM-DD')
      )
      .pipe(take(1))
      .subscribe(res => {
          switch (DELIVERY_METHODS[this.checkoutService.orderMetaData.data.deliveryMethod]) {
            case 'IN_STORE_LOCATION':
              if (!!res.inStoreLocation.selectedSlot && !!res.inStoreLocation.selectedSlot.startTime) {
                this.checkoutService.setOrderMetaState('wishTime', res.inStoreLocation.selectedSlot.startTime);
              }
              break;
            case 'NO_LOCATION':
              if (!!res.noLocation.selectedSlot && !!res.noLocation.selectedSlot.startTime) {
                this.checkoutService.setOrderMetaState('wishTime', res.noLocation.selectedSlot.startTime);
              }
              break;
            case 'ADDRESS':
              if (!!res.address.selectedSlot && !!res.address.selectedSlot.startTime) {
                this.checkoutService.setOrderMetaState('wishTime', res.address.selectedSlot.startTime);
              }
              break;
          }
          this.parseMetaData();
        },
        (() => this.parseMetaData()));
    } else {
      this.parseMetaData();
    }
  }

  // SCROLL THE PAGE
  scrollCalc() {
    this.showTotalInButton = this.helper.scrollShowElement(this.totalOrderPrice);
    this.showStickyScroll = this.helper.scrollCalc(this.scrollableContaner);
    this.innerHeight = this.helper.calcInnerHeight();
  }

  scrollPage() {
    this.helper.scrollPage(this.scrollableContaner);
  }

  scrollTo() {
    this.helper.scrollTo(this.checkoutDelivery.ShowMultipleChoice.nativeElement.offsetTop - 60, 700, this.scrollableContaner);
  }

  scrollToPayment() {
    if (this.scrollableContaner) {
      this.helper.scrollTo(this.scrollableContaner.nativeElement.scrollHeight, 700, this.scrollableContaner);
    }
  }

  scrollToWish() {
    if (this.wishTimeComponent && this.wishTimeComponent.wishWrapper && this.wishTimeComponent.wishWrapper.nativeElement) {
      this.helper.scrollTo(this.wishTimeComponent.wishWrapper.nativeElement.offsetTop, 700, this.scrollableContaner);
    }
  }

  openReadMoreModal(event, from) {
    event.preventDefault();
    this.currentPopUpFrom = from;
    this.renderer.removeClass(this.readMoreModal.nativeElement, 'hide');
  }

  OnCheckOutsideClose() {
    this.currentPopUpFrom =  '';
    this.renderer.addClass(this.readMoreModal.nativeElement, 'hide');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  enableScreenBlur(): boolean {
    // Screen blur is not enabled for VIVA payments, as in VIVA case popup is rendered inline and blurring hides it.
    return (
        this.cartStatus === 'LOADING' ||
        this.cartStatus === 'ORDERSUBMITTED'
      ) &&
      this.checkoutService.getPaymentMethod() !== PAYMENT_METHOD.VIVA;
  }

  onDecreaseItemQty(event, item: OrderItem) {
    event.stopPropagation();
    if (item.quantity > 1) {
      let childItemRequests = [];
      if (item.childOrderItems) {
        childItemRequests = item.childOrderItems.map((oItem) => ({offerId: oItem.offerId, quantity: oItem.quantity}));
      }
      item.quantity -= 1;
      if (item.variantOfferId) {
        childItemRequests.push({offerId: item.variantOfferId, quantity: item.quantity});
      }
      this.store.dispatch(new UpdateOrderItem(this.selectedStore.id, this.orderUuid, item.uuid, {
        childItemRequests,
        comment: item.comment,
        offerId: item.offerId,
        quantity: item.quantity,
      }));
    } else {
      item.quantity -= 1;
      this.store.dispatch(new RemoveOrderItem(this.selectedStore.id, this.orderUuid, item.uuid));
    }
  }

  onIncreaseItemQty(event, item: OrderItem) {
    event.stopPropagation();
    let childItemRequests = [];
    if (item.childOrderItems) {
      childItemRequests = item.childOrderItems.map((oItem) => ({offerId: oItem.offerId, quantity: oItem.quantity}));
    }
    item.quantity += 1;
    if (item.variantOfferId) {
      childItemRequests.push({offerId: item.variantOfferId, quantity: item.quantity});
    }
    this.store.dispatch(new UpdateOrderItem(this.selectedStore.id, this.orderUuid, item.uuid, {
      childItemRequests,
      comment: item.comment,
      offerId: item.offerId,
      quantity: item.quantity,
    }));
  }

  paymentSubmit() {
    if (this.paymentComponent) {
      this.paymentComponent.onSubmit();
    } else {
      this.store.dispatch(new ErrorMessage('public.checkout.errors.paymentFailed', '650'));
    }
  }
}
