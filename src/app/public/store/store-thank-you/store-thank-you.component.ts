import { Component, OnInit, OnDestroy, Inject, HostListener } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ClientStore, Order, LocationValid } from 'src/app/stores/stores';
import { SelectedStoreState, OrderMetaData, CartState } from '../+state/stores.reducer';
import { Store } from '@ngrx/store';
import { getSelectedStore, getCurrentOrderStatus, getOrderEmailStatus, getStoreLocationsState, getSelectedLang } from '../+state/stores.selectors';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import {
  ViewOrderStatus,
  CheckExistingOrder,
  InitializeOrder,
  SendOrderByEmail,
  ClearStoreLocation,
  ClearOrderMeta,
  ClearCheckoutState,
  ClearZonePerZipcode,
  ClearOrderByEmail,
  FetchSlots
} from '../+state/stores.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '../../location.service';
import { TranslateService } from '@ngx-translate/core';
import { CheckoutService, EMAIL_STATUS } from '../store-checkout/checkout.service';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { HelperService } from '../../helper.service';
import { Platform } from '@angular/cdk/platform';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-store-thank-you',
  templateUrl: './store-thank-you.component.html',
  styleUrls: ['./store-thank-you.component.scss']
})
export class StoreThankYouComponent implements OnInit, OnDestroy {

  emailConfirmationFG: FormGroup;
  selectedStore: ClientStore;
  selectedLang: string;
  browserTimeZone: string;
  orderStatus: CartState;
  cartState: Order;
  orderMeta$: Observable<OrderMetaData>;
  unsubscribe$: Subject<void> = new Subject<void>();
  interval = 5000; // ms
  timer: any = null;
  orderMappedStatus: string = null;
  emailStatus = -1; // -1 initial, 0 failed, 1 success
  validLocations: LocationValid = null; // not in use
  validLocation: number | string = null;
  paymentMethodsAfterTheFactObj = {};
  paymentMethodsAfterTheFact = [];
  numPaymentMethodsAfterTheFact = 0;
  EMAIL_STATUS = EMAIL_STATUS;
  isPos = false;
  innerHeight = 500;

  @HostListener('window:resize', ['$event'])
  @HostListener('window:scroll', ['$event'])
  onResize(event) {
    this.innerHeight = this.helper.calcInnerHeight();
  }

  constructor(
    private store: Store<SelectedStoreState>,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private locationService: LocationService,
    public helper: HelperService,
    private translate: TranslateService,
    private platform: Platform,
    private checkoutService: CheckoutService,
  ) {
    this.innerHeight = this.helper.calcInnerHeight();
  }

  ngOnInit() {
    this.browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.setEmailStatus(EMAIL_STATUS.UNDEFINED);
    this.store.select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.selectedStore = value;
        if (this.selectedStore.settings) {
          Object.keys(this.selectedStore.settings)
            .filter(setting => setting.match(/(POST_ORDER_PAYMENT_LINK_)([A-Z]+)*/))
            .map(key => {
              const provider: any = /(POST_ORDER_PAYMENT_LINK_)([A-Z]+)_([A-Z]+)*/g.exec(key)[2];
              const property: any = /(POST_ORDER_PAYMENT_LINK_)([A-Z]+)_([A-Z]+)*/g.exec(key)[3];
              if (!this.paymentMethodsAfterTheFactObj[provider]) {
                this.paymentMethodsAfterTheFactObj[provider] = {};
                this.paymentMethodsAfterTheFactObj[provider].method = provider;
              }
              this.paymentMethodsAfterTheFactObj[provider][property] = this.selectedStore.settings[key];
              if (property === 'ENABLED' && this.selectedStore.settings[key] === true) {
                this.numPaymentMethodsAfterTheFact++;
              }
            });
          this.paymentMethodsAfterTheFact = Object.values(this.paymentMethodsAfterTheFactObj);
        }
        // /calling social media links
        this.fetchSocialMedia();
      });

    combineLatest([this.store.select(getCurrentOrderStatus), this.store.select(getStoreLocationsState), this.store.select(getSelectedLang)])
      .pipe(
        // disabling the following line as this prevents polling when there is payment(order status is draft in this case)
        // filter(state => !!state && !!state[0] && !!state[0].data && state[0].data.status !== 'DRAFT'),
        filter(state => !!state && !!state[0]),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(state => {
        this.orderStatus = state[0];
        this.cartState = this.orderStatus.data;
        if (this.cartState && this.cartState.location) {
          this.validLocation = this.cartState.location;
        }
        // map the status

        if (
          this.orderStatus && this.orderStatus.data &&
          (
            this.orderStatus.data.status === 'SUBMITTED' ||
            this.orderStatus.data.status === 'RECEIVED' ||
            this.orderStatus.data.status === 'DRAFT'
          )
        ) {
          this.startStatusListener();
        } else {
          this.stopStatusListener();
        }
        if (state[1]) {
          this.validLocations = state[1];
        }
        if (state[2]) {
          this.selectedLang = state[2];
        }
      });

    this.store.select(getOrderEmailStatus)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state.orderEmail.status === 'SENDING') {
          this.setEmailStatus(EMAIL_STATUS.SENDING);
        }
        if (state && state.orderEmail.status === 'SENT') {
          this.setEmailStatus(EMAIL_STATUS.SUCCESS);
        }
        if (state && state.orderEmail.status === 'FAILED') {
          this.setEmailStatus(EMAIL_STATUS.FAILED);
        }
      }
    );

    // set personal info form validator rules
    this.emailConfirmationFG = this.fb.group({
      email: ['', Validators.compose([CustomValidators.email, Validators.maxLength(40)])]
    });

    this.router.events
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: NavigationStart) => {
        if (event.navigationTrigger === 'popstate') {
          this.onGoToDashboard();
        }
      });
    this.isPos = this.router.url.includes('/capture/');
  }

  getControl(name: string, form: string = 'emailConfirmationFG') {
    return this[form].get(name);
  }

  onSubmitOrderOnEmail(sendSilent = false) {
    if (this.emailConfirmationFG.invalid) {
      this.getControl('email').markAsTouched();
      return;
    }
    if (!!this.orderStatus.data) {
      this.store.dispatch(new SendOrderByEmail(
        this.orderStatus.data.uuid,
        this.getControl('email').value,
        this.translate.defaultLang,
        this.selectedLang,
        sendSilent,
      ));
    }
  }

  private startStatusListener() {
    if (this.timer === null) {
      this.timer = setInterval(() => {
        if (this.selectedStore && this.orderStatus) {
          this.store.dispatch(new ViewOrderStatus(
            this.selectedStore.id,
            this.orderStatus.data.uuid,
            'CHECKEXISTING',
            this.selectedLang,
          ));
        }
      }, this.interval);
    }
  }

  private stopStatusListener() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
  }

  getBackgroundImage(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  OnEmailInputChanged() {
    // reset mail status message in case there is one
    this.setEmailStatus(EMAIL_STATUS.UNDEFINED);
  }

  onGoToDashboard(event?) {
    if (event) {
      event.preventDefault();
    }
    if (this.emailStatus === EMAIL_STATUS.UNDEFINED && this.getControl('email').value !== '' && this.emailConfirmationFG.valid) {
      this.onSubmitOrderOnEmail(true);
    }
    this.setEmailStatus(EMAIL_STATUS.UNDEFINED);
    this.store.dispatch(new InitializeOrder(this.selectedStore.id, this.getInitOrder()));
    this.locationService.setOrderUuid('');
    this.router.navigateByUrl(this.locationService.base_url(''));
  }

  getInitOrder() {
    const order: Order = {
      orderItems: []
    };
    if (this.checkoutService.ifOnlyInStore()) {
      order.deliveryMethod = 'IN_STORE_LOCATION';
    } else if (this.checkoutService.ifOnlySelfPickup()) {
      order.deliveryMethod = 'NO_LOCATION';
    } else if (this.checkoutService.ifOnlyDeliveryToAddress()) {
      order.deliveryMethod = 'ADDRESS';
    } else if (
      this.selectedStore.settings.DEFAULT_DELIVERY_MODE &&
      this.checkoutService.ifDeliveryMethodEnabled(this.selectedStore.settings.DEFAULT_DELIVERY_MODE)
    ) {
      order.deliveryMethod = this.selectedStore.settings.DEFAULT_DELIVERY_MODE;
    }
    this.store.dispatch(new ClearOrderMeta({}));
    this.store.dispatch(new ClearCheckoutState());
    this.store.dispatch(new ClearZonePerZipcode());
    this.store.dispatch(new ClearOrderByEmail());
    this.store.dispatch(new FetchSlots(this.selectedStore.id, order.deliveryMethod));
    return order;
  }

  setEmailStatus(status) {
    if (Object.values(EMAIL_STATUS).includes(status)) {
      this.emailStatus = status;
    }
  }

  shouldDisplayAppLinks() {
    return (this.shouldDisplayAppStore() || this.shouldDisplayPlayStore());
  }

  shouldDisplayPlayStore() {
    if (this.isAndroid() && (this.selectedStore.settings.PROMOTE_GONNAORDER_APP || this.selectedStore.settings.PROMOTE_STORE_APP)) {
      return true;
    } else {
      return false;
    }
  }

  shouldDisplayAppStore() {
    if (this.isIOS() && (this.selectedStore.settings.PROMOTE_GONNAORDER_APP || this.selectedStore.settings.PROMOTE_STORE_APP)) {
      return true;
    } else {
      return false;
    }
  }

  isAndroid() {
    return this.platform.ANDROID;
  }

  isIOS() {
    return this.platform.IOS;
  }

  onClickGooglePlay() {
    if (this.selectedStore && this.selectedStore.aliasName && this.selectedStore.settings) {
      let targetAppUrl = '';
      let targetDeeplinkUrl = '';
      if (this.selectedStore.settings.PROMOTE_GONNAORDER_APP) {
        targetAppUrl = environment.defaultDeeplinkAppAndroidUrl;
        targetDeeplinkUrl = `${environment.defaultDeeplinkAppId}://localhost/public/customer/store/${this.selectedStore.aliasName}`;
        setTimeout(() => {
          window.location.href = targetAppUrl;
        }, 50);
        window.location.href = targetDeeplinkUrl;
      } else if (this.selectedStore.settings.PROMOTE_STORE_APP && this.selectedStore.settings.STORE_APP_ANDROID_URL) {
        targetAppUrl = this.selectedStore.settings.STORE_APP_ANDROID_URL;
        // Disabled deeplink as backend is not ready yet...
        // targetDeeplinkUrl =
        //   `${this.selectedStore.settings.STORE_APP_ANDROID_APPID}://localhost/public/template/${this.selectedStore.aliasName}`;
        setTimeout(() => {
          window.location.href = targetAppUrl;
        }, 50);
        // window.location.href = targetDeeplinkUrl;
      }
    }
  }

  onClickAppStore() {
    if (this.selectedStore && this.selectedStore.aliasName) {
      let targetAppUrl = '';
      let targetDeeplinkUrl = '';
      if (this.selectedStore.settings.PROMOTE_GONNAORDER_APP) {
        targetAppUrl = environment.defaultDeeplinkAppIOSUrl;
        targetDeeplinkUrl = `${environment.defaultDeeplinkAppId}://localhost/public/customer/store/${this.selectedStore.aliasName}`;
        setTimeout(() => {
          window.location.href = targetAppUrl;
        }, 50);
        window.location.href = targetDeeplinkUrl;
      } else if (this.selectedStore.settings.PROMOTE_STORE_APP && this.selectedStore.settings.STORE_APP_IOS_URL) {
        targetAppUrl = this.selectedStore.settings.STORE_APP_IOS_URL;
        // Disabled deeplink as backend is not ready yet...
        // targetDeeplinkUrl =
        //   `${this.selectedStore.settings.STORE_APP_IOS_APPID}://localhost/public/template/${this.selectedStore.aliasName}`;
        setTimeout(() => {
          window.location.href = targetAppUrl;
        }, 50);
        // window.location.href = targetDeeplinkUrl;
      }
    }
  }

  // fetching the links of social media.
  fetchSocialMedia(){
    if (this.selectedStore.settings.FACEBOOK_URL && (!(this.selectedStore.settings.FACEBOOK_URL as string).startsWith('https://'))) {
      this.selectedStore.settings.FACEBOOK_URL = 'https://' + this.selectedStore.settings.FACEBOOK_URL;
    }
    if (this.selectedStore.settings.INSTAGRAM_URL && (!(this.selectedStore.settings.INSTAGRAM_URL as string).startsWith('https://'))) {
      this.selectedStore.settings.INSTAGRAM_URL = 'https://' + this.selectedStore.settings.INSTAGRAM_URL;
    }
    if (this.selectedStore.settings.CARDITIO_URL && (!(this.selectedStore.settings.CARDITIO_URL as string).startsWith('https://'))) {
      this.selectedStore.settings.CARDITIO_URL = 'https://' + this.selectedStore.settings.CARDITIO_URL;
    }
  }

  ngOnDestroy() {
    this.stopStatusListener();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
