import { Component, OnInit, ElementRef, OnDestroy, DoCheck, Inject, ViewChild, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ClientStore, StoreViewState, Order, Lang } from 'src/app/stores/stores';
import { Store, select } from '@ngrx/store';
import { CookieService } from 'ngx-cookie-service';
import { CatalogState, CatalogList } from '../+state/stores.reducer';
import {
  getSelectedStore,
  getCurrentStoreViewStatus,
  getSelectedCategory,
  getAvailableCatalogLanguages,
  getSelectedLang,
  getCartState,
  getSelectedStoreStatus,
  getCurrentCartStatus,
  getCookieState,
  getOrderWish,
  getOrderMetaState,
  getStoreOpeningInfo,
  getLoadedCatalogLanguage,
  getCurrentCartUuid,
} from '../+state/stores.selectors';
import {
  LoadCatalog,
  InitializeOrder,
  CheckExistingOrder,
  LoadCatalogLanguages,
  SelectCatalogLanguage,
  ErrorMessage,
  GetStoreRules,
  FetchSlots,
  AcceptCookie,
  RejectCookie,
  UpdateOrderWish,
  ViewStateUpdateUserLanguage,
} from '../+state/stores.actions';
import { ActivatedRoute, Router, Scroll } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil, delay, tap, filter, withLatestFrom } from 'rxjs/operators';
import { LocationService } from '../../location.service';
import { HelperService } from '../../helper.service';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from '../../window-providers';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import { CheckoutService } from '../store-checkout/checkout.service';
import { DateAdapter } from '@angular/material/core';
import { CheckStoreHasNewOrderFailed } from 'src/app/stores/+state/stores.actions';
@Component({
  selector: 'app-store-loading',
  templateUrl: './store-loading.component.html',
  styleUrls: ['./store-loading.component.scss']
})
export class StoreLoadingComponent implements OnInit, OnDestroy, DoCheck {

  catalogLoaded: boolean;
  storeViewState$: Observable<StoreViewState>;
  store$: Observable<ClientStore>;
  cartState: Order;
  unsubscribe$: Subject<void> = new Subject<void>();
  selectedStore: ClientStore;
  availableCatalogLanguages: Lang[];
  selectedCategory: number;
  loadedCatalogLang: string;
  loadView: string;
  cookieEnabled = false;
  ulang: string;  // query param user language - overrides the user language preference in the browser
  clang: string;  // query param catalog lanugage - overrides the store default lanugage (if exitsts for store)
  wish: string;  // query param wish day
  langLoaded = false;
  isPos = false;
  showCookieMessage = false;
  lang: string;
  cookieBarHeight = 0;
  storeOpeningInfo = null;
  currentPopUpFrom: string;
  isAdminOrderUpdate = false;

  @ViewChild('cookieBar') cookieBar: ElementRef;
  @ViewChild('readMoreSelectorModal') readMoreModal: ElementRef;

  constructor(
    private store: Store<CatalogState>,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private router: Router,
    private locationService: LocationService,
    private helper: HelperService,
    private cd: ChangeDetectorRef,
    private checkoutService: CheckoutService,
    private renderer: Renderer2,
    private dateAdapter: DateAdapter<any>,
    @Inject(DOCUMENT) private document: any,
    @Inject(WINDOW) private window: Window
  ) {
    this.router.events.forEach((event) => {
      if (event instanceof Scroll) {
        // the loadView must be called after all store info has finished loading
        // console.log('%c I AM IN load view', 'background: #222; color: #bada55');
        this.locationService.loadView(event.anchor);
        this.loadView = event.anchor;
      }
    });
    this.isAdminOrderUpdate = this.locationService.isAdminOrderUpdate();
  }

  ngDoCheck() {
    this.calcCookieBarHeight();
  }

  calcCookieBarHeight() {
   if (this.cookieBar && this.cookieBar.nativeElement) {
     this.cookieBarHeight = this.cookieBar.nativeElement.offsetHeight;
   }
  }

  private loadLanguage(locale) {
    return import(`./../../translations/i18n/translation.${locale}.json`)
      .then(lang => {
        this.translate.setTranslation(locale, {...lang});
        this.translate.setDefaultLang(locale);

        this.langLoaded = true;
        switch (locale) {
          case 'en':
          case 'fr':
          case 'nl':
          case 'el':
          case 'ja':
            this.lang = locale;
            break;
          default:
            this.lang = 'en';
        }
        // set datepicker locale with user language
        if (this.lang) {
          this.dateAdapter.setLocale(this.lang);
        }
        // store user language to view state...
        this.store.dispatch(new ViewStateUpdateUserLanguage(this.lang));
      });
  }

  ngOnInit() {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(isBetween);
    // calculate view port height
    this.calcViewPortHeight();
    // check cookies
    this.cookieEnabled = this.cookiesEnabled();
    // subscribe to query params for languages & wish day
    this.route.fragment
      .pipe(
        withLatestFrom(this.store.select(getOrderWish)),
        takeUntil(this.unsubscribe$)
      ).subscribe(([f, wishDate]) => {

        let qParams: any = { params: {} };
        if (f && f.split('?')[1]) {
          f.split('?')[1].split('&').map(p => qParams.params[p.split('=')[0]] = decodeURIComponent(p.split('=')[1]));
        }
        if (Object.keys(qParams.params).length === 0 && qParams.params.constructor === Object) {
          this.route.queryParamMap.subscribe(p => {
            qParams = { ...p };
          });
        }
        this.ulang = (qParams.params.ulang && this.helper.checkValidLangIso(qParams.params.ulang.toLowerCase()))
          ? qParams.params.ulang.toLowerCase() : null;
        if (!this.ulang) {
          this.ulang = this.locationService.locale;
        }
        this.clang = (qParams.params.clang && this.helper.checkValidLangIso(qParams.params.clang.toLowerCase()))
          ? qParams.params.clang.toLowerCase() : null;

        this.wish = qParams.params.wish;
        const wishDateString = dayjs(wishDate).format('YYYY-MM-DD');
        if (this.wish && this.wish !== wishDateString) {
          this.store.dispatch(new UpdateOrderWish(new Date(this.wish)));
        }
      });
    // load language from browser
    this.loadLanguage(this.ulang ? this.ulang : this.translate.getBrowserLang())
      .catch(_ => {
        this.loadLanguage('en');
        this.langLoaded = true;
      });
    this.catalogLoaded = false;
    this.store$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.store.select(getSelectedStore)
      .pipe(
        takeUntil(this.unsubscribe$),
        withLatestFrom(this.store.pipe(select(getAvailableCatalogLanguages))),
      )
      .subscribe(([selectedStore, availableLanguageList]) => {
        this.selectedStore = selectedStore;
        if (this.selectedStore && this.selectedStore.id) {
          // set document title
          this.document.title = this.selectedStore.name;
          // Added Google Analytics and Facebook pixel
          const gaCode = this.selectedStore.settings.GOOGLE_ANALYTICS_TRACKING_CODE;
          if (gaCode) {
            const gtagScript = document.createElement('script');
            gtagScript.type = 'text/javascript';
            gtagScript.async = true;
            gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaCode;
            document.head.appendChild(gtagScript);

            const gtagConfigScript = document.createElement('script');
            gtagConfigScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config','` + gaCode + `');`;
            document.head.appendChild(gtagConfigScript);
          }
          if (availableLanguageList?.loadedStoreId !== this.selectedStore.id) {
            this.store.dispatch(new LoadCatalogLanguages(this.selectedStore.id));
          }
        }
      });
    // select store catalog languages
    combineLatest([
      this.store.select(getAvailableCatalogLanguages),
      this.store.select(getSelectedStoreStatus)
    ])
      .pipe(
        takeUntil(this.unsubscribe$),
        withLatestFrom(this.store.pipe(select(getSelectedLang)), this.store.pipe(select(getCurrentCartUuid)))
      )
      .subscribe(([[state, selectedStoreStatus], selectedLang, currentCartUuid]) => {
        if (selectedStoreStatus !== 'LOADED') {
          return;
        }
        if (state && state.status === 'FETCHED') {
          this.availableCatalogLanguages = state.data;
          // const selectedCatalogLang = this.getCatalogLang(this.translate.getLangs().reverse());
          const selectedCatalogLang = this.getCatalogLang(this.getCatalogPreferedLangs().reverse());
          if (selectedCatalogLang !== '') {
            if (selectedCatalogLang !== selectedLang) {
              this.store.dispatch(new SelectCatalogLanguage(selectedCatalogLang));
            }
            /**
             * if set orderUuid in cookie => check for existing order
             * if not initialize new order object
             */
            let orderUuid = null;
            if (this.locationService.getOrderUuid()) {
              orderUuid = this.locationService.getOrderUuid();
            } else {
              orderUuid = this.cookieService.get('orderUuid-' + (this.isAdminOrderUpdate ? 'admin-' : '') + this.selectedStore.aliasName);
            }
            if (orderUuid) {
              this.store.dispatch(new CheckExistingOrder(this.selectedStore.id
                , orderUuid
                , 'CHECKEXISTING'
                , selectedCatalogLang
              ));
            } else {
              this.store.dispatch(new InitializeOrder(this.selectedStore.id, this.getInitOrder()));
            }
            this.store.dispatch(new GetStoreRules(this.selectedStore.id, selectedCatalogLang));
          } else {
            this.store.dispatch(new ErrorMessage('public.global.errorExpected', '101'));
          }
        }
      });

    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartStatus),
      this.store.select(getCookieState),
    ])
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(([selectedStore, currentCartStatus, cookieState]) => {
        if (selectedStore && currentCartStatus === 'LOADED' && cookieState) {
          const fbCode = selectedStore.settings.FACEBOOK_PIXEL_TRACKING_ID;
          const fbMetaContent = selectedStore.settings.FACEBOOK_DOMAIN_VERIFICATION_CODE;
          switch (cookieState.cookieState.status) {
            case 'UNSET':
              if (fbCode) {
                this.showCookieMessage = true;
              }
              break;
            case 'ACCEPT':
              if (fbCode) {
                const fbpixelConfigScript = document.createElement('script');
                fbpixelConfigScript.innerHTML = `!function (f, b, e, v, n, t, s) {
                  if (f.fbq) return; n = f.fbq = function () {
                      n.callMethod ?
                      n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                  };
                  if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                  n.queue = []; t = b.createElement(e); t.async = !0;
                  t.src = v; s = b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t, s)
                  }(window, document, 'script',
                      'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init','` + fbCode + `');
                  fbq('track', 'PageView');`;
                document.head.appendChild(fbpixelConfigScript);
                const fbpixelScript = document.createElement('noscript');
                const fbimg = document.createElement('img');
                fbimg.height = 1;
                fbimg.width = 1;
                fbimg.src = 'https://www.facebook.com/tr?id=' + fbCode + '&ev=PageView&noscript=1';
                fbpixelScript.appendChild(fbimg);
                document.head.appendChild(fbpixelScript);
              }
              if (fbMetaContent) {
                const fbMetaTag = document.createElement('meta');
                fbMetaTag.name = 'facebook-domain-verification';
                fbMetaTag.content = fbMetaContent;
                document.head.appendChild(fbMetaTag);
              }
              this.showCookieMessage = false;
              break;
            default:
              this.showCookieMessage = false;
          }
        }
    },
    err => console.log('Error:', err),
    );
    this.store
      .select(getStoreOpeningInfo)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(storeOpeningInfo => {
        this.storeOpeningInfo = storeOpeningInfo;
      });
    this.store
      .select(getLoadedCatalogLanguage)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(lang => this.loadedCatalogLang = lang);
    // load the catalog for selected store and language
    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getSelectedLang),
      this.store.select(getCurrentCartStatus),
      ]).pipe(
        takeUntil(this.unsubscribe$),
        filter(([store, language, cartStatus]) => !!store && !!store.id && !!language && cartStatus === 'LOADED')
      )
      .subscribe(([store, language]) => {
        const deliveryMethod = this.checkoutService.getPickupMethodStr();
        if (store.settings.DELIVERY_REQUEST_ORDER_DATE_UPFRONT && deliveryMethod) {
          if (!this.storeOpeningInfo || this.storeOpeningInfo.deliveryMethod !== deliveryMethod) {
            if (this.wish) {
              this.store.dispatch(new FetchSlots(store.id, deliveryMethod, this.wish));
            } else {
              this.store.dispatch(new FetchSlots(store.id, deliveryMethod));
            }
            return;
          }
        } else if (store.settings.DELIVERY_REQUEST_ORDER_DATE_UPFRONT && store.settings.DEFAULT_DELIVERY_MODE) {
          if (!this.storeOpeningInfo || this.storeOpeningInfo.deliveryMethod !== store.settings.DEFAULT_DELIVERY_MODE) {
            if (this.wish) {
              this.store.dispatch(new FetchSlots(store.id, store.settings.DEFAULT_DELIVERY_MODE, this.wish));
            } else {
              this.store.dispatch(new FetchSlots(store.id, store.settings.DEFAULT_DELIVERY_MODE));
            }
            return;
          }
        }
        if (this.loadedCatalogLang !== language) {
          this.store.dispatch(new LoadCatalog(store.id, language));
        }
      });

    this.store.select(getSelectedCategory)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        this.selectedCategory = state;
      });

    this.storeViewState$ = this.store.pipe(
      delay(0),
      select(getCurrentStoreViewStatus),
      tap(_ => this.cd.detectChanges())
    );

    // subscribe to cart state
    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(getCartState),
      withLatestFrom(this.store.select(getSelectedStore))
    ).subscribe(([state, store]) => {
        this.loadProperView();
        const cartState = state.cartState;
        if (cartState.status === 'CHECKEXISTINGFAILED') {
          this.store.dispatch(new InitializeOrder(this.selectedStore.id, this.getInitOrder()));
        }
        if (cartState.status === 'LOADED') {
          if (cartState.data.uuid != null) {
            if (!this.cookieEnabled) {
              this.locationService.setOrderUuid(cartState.data.uuid);
            } else {
              this.locationService.setOrderUuid('');
              this.cookieService.set(
                'orderUuid-' + (this.isAdminOrderUpdate ? 'admin-' : '') + store.aliasName,
                cartState.data.uuid,
                1,
                '/'
              );
            }
          }

          // redirect to thank you page when order is not draft, but not initialzing new order....
          if (!this.router.url.includes('/orders/') && cartState.data.status !== 'DRAFT') {
            this.router.navigateByUrl(`${this.locationService.public_url()}#thankyou/e/${cartState.data.uuid}`);
          }
        }
      });

    this.isPos = this.router.url.includes('/capture/');
  }

  onAcceptCookie() {
    this.cookieService.set('cookieEnabled', 'ACCEPT');
    this.store.dispatch(new AcceptCookie());
  }

  onRejectCookie() {
    this.cookieService.set('cookieEnabled', 'REJECT');
    this.store.dispatch(new RejectCookie());
  }

  cookiesEnabled() {
    let cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
    }
    return (cookieEnabled);
  }

  loadProperView() {
    this.locationService.loadView(this.loadView);
  }

  // If the ui language of the browser exists in the catalog language list of the store
  // (which means there are some translations for this language)
  // then the system pre-selects the catalog language to be same as the ui language.
  // If not, the catalog language is the language of the store
  getCatalogPreferedLangs() {
    let ret = [];
    if (this.window.navigator.languages) {
      ret = this.window.navigator.languages.map((lang) => lang.substring(0, 2));
    } else {
      ret = [this.translate.getBrowserLang()];
    }
    if (this.ulang) {
      ret.unshift(this.ulang);
    }
    if (this.clang) {
      ret.unshift(this.clang);
    }
    return ret;
  }

  getCatalogLang(preferedLanguages) {
    if (!this.availableCatalogLanguages || this.availableCatalogLanguages.length === 0) {
      return '';
    }
    let catalogLang = this.availableCatalogLanguages[0].locale;
    preferedLanguages.forEach(lang => {
      this.availableCatalogLanguages.forEach(availableLang => {
        if (availableLang.locale === lang) {
          catalogLang = lang;
        }
      });
    });
    return catalogLang;
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
    if (this.route.snapshot.paramMap.get('locationid')) {
      order.locationId = parseInt(this.route.snapshot.paramMap.get('locationid'), 10);
    }
    return order;
  }

  calcViewPortHeight() {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    const vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
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

}
