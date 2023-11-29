
// tslint:disable: no-string-literal
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ViewState, CatalogList } from './store/+state/stores.reducer';
import {
  ViewStateUpdate,
  SelectCategory,
  ViewOrderItem,
  ErrorMessage,
  UpdateOrderMetaStatus,
  ViewOrderStatus,
  ValidateStoreLocations,
} from './store/+state/stores.actions';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  getCurrentError,
  getCurrentCartContent,
  getSelectedStoreCatalog,
  getCurrentCartState,
  getStoreLocationsState,
  getSelectedLang,
} from './store/+state/stores.selectors';
import { getSelectedStore } from './store/+state/stores.selectors';
import { ClientStore, OrderItem, Order } from '../stores/stores';
import { combineLatest } from 'rxjs';
import { HelperService } from './helper.service';
import { WindowRefService } from '../window.service';
import { CompleteTrustPaymentsPayment } from './payments/+state/payment.actions';
import { TrustPaymentsPaymentInfo } from './payments/payment.types';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  selectedStore: ClientStore;
  selectedLang: string;
  catalog: CatalogList;
  cart: Order;
  refreshAction: string = null;
  refreshActionAfterLocationValidation: string = null;
  orderUuid: string = null;
  locale: string = null;
  storeLocation: string = null;
  basketEnabled: boolean = null;
  private storeLocationUrl: string = null;
  trustPaymentsTransactionReference: string = null;

  constructor(
    private store: Store<ViewState>,
    private router: Router,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private helper: HelperService,
    private windowRefSer: WindowRefService,
    private location: Location,
  ) {
    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getSelectedStoreCatalog),
      this.store.select(getCurrentCartState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ]).subscribe(results => {
        if (results[0] && results[1].data.catalogId !== -1) {
          this.selectedStore = results[0];
          this.catalog = results[1];
          if (results[2]) {
            this.cart = results[2];
          }
          if (results[3] && results[3].isValid && results[3].id !== -1) {
            this.storeLocation = results[3].label;
            if (this.refreshActionAfterLocationValidation) {
              this.loadView(this.refreshActionAfterLocationValidation);
              // 04.06.2020: don't persist the location to the current order
              // https://trello.com/c/dOfSiejV/1640-order-with-location-improvments
              this.refreshActionAfterLocationValidation = null;
            }
          }
          if (this.refreshAction) {
            this.loadView(this.refreshAction);
            this.refreshAction = null;
          }
        }
        if (results[4]) {
          this.selectedLang = results[4];
        }
      });
    this.store.select(getCurrentError)
      .subscribe(state => {
        if (state.status !== 'INITIAL') {
          this.store.dispatch(new ViewStateUpdate({
            state: 'ERRORPAGE'
          }));
        }
      });
  }

  loadView(path) {
    let urlParams = [''];
    if (path) {
      urlParams = path.split('?')[0].split('/');
      while (urlParams.length) {
        if (urlParams[0] === 'orderUuid') {
          this.orderUuid = urlParams[1];
        } else if (urlParams[0] === 'l') {
          this.storeLocationUrl = urlParams[1];
          if (this.selectedStore && this.storeLocation) {
            if (this.storeLocation !== urlParams[1]) {
              if (this.selectedStore) {
                this.refreshActionAfterLocationValidation = path;
                this.store.dispatch(new ValidateStoreLocations(this.selectedStore.id, urlParams[1]));
              }
              this.refreshAction = path;
            }
          } else {
            if (this.selectedStore) {
              this.refreshActionAfterLocationValidation = path;
              this.store.dispatch(new ValidateStoreLocations(this.selectedStore.id, urlParams[1]));
            }
            this.refreshAction = path;
          }
        } else {
          break;
        }
        urlParams.splice(0, 2);
      }
    }
    switch (urlParams[0]) {
      case 'category':
        if (this.selectedStore && this.catalog) {
          if (!this.selectedStore) {
            this.store.dispatch(new ErrorMessage('public.global.errorExpected'));
            return;
          }
          this.store.dispatch(new SelectCategory( parseInt( urlParams[1], 10) ) );
          this.store.dispatch(new ViewStateUpdate({state: 'LOADED'}));
        } else {
          this.refreshAction = path;
        }
        break;
      case 'offer': {
          const offerId = parseInt( urlParams[1], 10);
          if (this.selectedStore && this.catalog) {
            if (offerId) {
              this.store.dispatch(new ViewOrderItem( this.selectedStore.id, this.catalog.data.catalogId, offerId, '', this.selectedLang ) );
              this.store.dispatch(new ViewStateUpdate({state: 'VIEWPRODUCTDETAILS'}));
            } else {
              this.store.dispatch(new ErrorMessage('public.global.errorExpected'));
            }
          } else {
            this.refreshAction = path;
          }
          break;
      }
      case 'orderItem': {
          const orderId = urlParams[1];
          if (this.selectedStore && this.catalog && this.cart && this.cart.orderItems) {
            if (orderId) {
              let offerId = null;
              this.cart.orderItems.forEach( orderItem => {
                if (orderItem.uuid === orderId) {
                  offerId = orderItem.offerId;
                }
              });
              if (offerId) {
                this.store.dispatch(
                  new ViewOrderItem(
                    this.selectedStore.id,
                    this.catalog.data.catalogId,
                    offerId,
                    orderId,
                    this.selectedLang
                  )
                );
                this.store.dispatch(new ViewStateUpdate({state: 'VIEWPRODUCTDETAILSFROMCARTVIEW'}));
              } else {
                this.store.dispatch(new ErrorMessage('public.global.errorExpected'));
                console.error('unexpected offerId value', offerId);
              }
            } else {
              this.store.dispatch(new ErrorMessage('public.global.errorExpected'));
              console.error('unexpected orderUuid value', orderId);
            }
          } else {
            this.refreshAction = path;
          }
          break;
        }
      case 'cart':
        this.store.dispatch(new ViewStateUpdate({state: 'VIEWCART'}));
        break;
      case 'emptycart':
        console.log('dispatching EMPTY CART PAGE');
        this.store.dispatch(new ViewStateUpdate({state: 'EMPTYCARTPAGE'}));
        break;
      case 'checkout':
        this.store.dispatch(new ViewStateUpdate({state: 'CHECKOUT'}));
        break;
      case 'thankyou':
        if (this.selectedStore) {
          if (urlParams[1]) {
            let orderId = urlParams[1];
            if (urlParams[1] === 'e') {
              this.orderUuid = this.cart.uuid;
              orderId = urlParams[2];
            }
            this.store.dispatch(new ViewOrderStatus(  this.selectedStore.id
                                                    , orderId
                                                    , 'CHECKEXISTING'
                                                    , this.selectedLang
            ));
            this.store.dispatch(new ViewStateUpdate({state: 'THANKYOUPAGE'}));
          } else {
            this.store.dispatch(new ErrorMessage('public.global.errorExpected'));
            console.error('unexpected orderUuid value', urlParams[1]);
          }
        } else {
          this.refreshAction = path;
        }
        break;
      case 'stripePaymentSuccess':
        console.log('stipe payment success detected!');
        this.route.queryParams
          .subscribe(params => {
            console.log(params, this.cookieService.get('stripeSessionId'));
            if (params.session_id === this.cookieService.get('stripeSessionId')) {
              // PAYMENT SUCCESSFULL
              console.log('payment successfull');
              this.store.dispatch(new UpdateOrderMetaStatus('FINISHED_ONLINE_PAYMENT'));
              this.store.dispatch(new ViewStateUpdate({state: 'CHECKOUT'}));
            } else {
              console.log('payment NOT successfull', 'reason', 'stripe session id doesn\'t match');
            }
          });
        break;
      case 'verifyPayment':
        const storeId = urlParams[1];
        const orderUuid = urlParams[2];
        const status = urlParams[3];
        let reqPayload = path.split('?')[1];
        reqPayload = JSON.parse('{"' + decodeURI(reqPayload).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
        if (this.selectedStore && storeId && String(this.selectedStore.id) !== storeId) {
          this.store.dispatch(new ErrorMessage('public.global.errorExpected'));
          return;
        }
        if (storeId && orderUuid && reqPayload) {
          const queryParams: TrustPaymentsPaymentInfo = reqPayload;
          if (!this.trustPaymentsTransactionReference || this.trustPaymentsTransactionReference !== queryParams.transactionreference) {
            this.trustPaymentsTransactionReference = queryParams.transactionreference;
            switch (status) {
            case 'error':
            case 'declined':
            case 'success':
              this.store.dispatch(new CompleteTrustPaymentsPayment(Number(storeId), orderUuid, queryParams));
              break;
            }
          }
        } else {
          this.store.dispatch(new ErrorMessage('public.global.errorExpected'));
          console.error('TrustPayments payment failed for orderUuid value', orderUuid);
          this.refreshAction = path;
        }
        break;
      default:
        this.store.dispatch(new ViewStateUpdate({state: 'LOADED'}));
        break;
    }
  }

  /**
   * get orderUuid passed through url
   * it will always take presedence over the cookie or state orderUuid
   * @returns (string) orderUuid
   */
  getOrderUuid() {
    return this.orderUuid;
  }
  setOrderUuid(uuid) {
    this.orderUuid = uuid;
  }

  /**
   * get storeLocation passed through url
   * it will always take presedence over the cookie or state storeLocation
   * @returns (string) storeLocation
   */
  getStoreLocation() {
    return (this.storeLocation !== 'null') ? this.storeLocation : null;
  }
  getUrlStoreLocation() {
    return (this.storeLocationUrl !== 'null') ? this.storeLocationUrl : null;
  }
  clearStoreLocationUrl() {
    this.storeLocationUrl = null;
  }
  setStoreLocation(location) {
    console.log('setting storelocation');
    this.storeLocation = location;
  }

  public_url() {
    const url: string = this.router.url;
    return url.split('#')[0];
  }
  /**
   * returns customer UI base navigation url
   * it determines if orderUuid and location params should be prepended to the hash
   * @param destination string
   */
  isOrderCapture(): boolean {
    return this.public_url().includes('/capture/');
  }
  base_url(destination) {
    // console.log(this.public_url());

    if (this.orderUuid) {
      destination = `orderUuid/${this.orderUuid}/${destination}`;
    }

    // Note: do not reference previous table number when admin order capture.
    if (this.storeLocation && !this.isOrderCapture()) {
      destination = `l/${this.storeLocation}/${destination}`;
    }
    if (destination === '') {
      return this.public_url();
    }
    return `${this.public_url()}#${destination}`;
  }

  /**
   * method to go back to previous page
   * @param fallbackPath | optional, targetted fallback path in case there is no location
   * in the history to go back to, it should include the # for instance '#catalog'
   * defaults to catalog view screen
   */
  goBack(fallbackPath = '') {
    const navState: any = this.location.getState();

    // baypass safari's issues with location history
    if (/safari/i.test(this.windowRefSer.nativeWindow.navigator.userAgent)
        && !/Chrome/i.test(this.windowRefSer.nativeWindow.navigator.userAgent)) {
          // tslint:disable-next-line: no-string-literal
          if ( this.location['_platformLocation'].location.href === `${this.windowRefSer.nativeWindowLocation.origin}${this.router.url}`) {
            this.router.navigateByUrl('');
          }
    }
    // if no previous state to go back to
    // default to catalog view
    if (navState && navState.navigationId > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl(this.public_url() + fallbackPath);
    }
  }

  setBasketEnabled(basketEnabled: boolean) {
    this.basketEnabled = basketEnabled;
  }

  setLocale(locale: string) {
    this.locale = locale;
  }

  isBasketEnabled(): boolean {
    return this.basketEnabled;
  }

  isAdminOrderUpdate() {
    return this.router.url.includes('/orders/');
  }
}
