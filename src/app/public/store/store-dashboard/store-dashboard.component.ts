import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Inject,
  AfterViewInit,
  HostListener,
  AfterViewChecked,
  Renderer2,
  Input,
} from '@angular/core';
import { ClientStore, Category, OrderItem } from 'src/app/stores/stores';
import { Store, select } from '@ngrx/store';
import { SelectedStoreState, CatalogList } from '../+state/stores.reducer';
import {
  getSelectedStore,
  getSelectedStoreStatus,
  getSelectedStoreCatalog,
  getCurrentCartUuid,
  getCurrentCartContent,
  getCurrentCartStatus,
  getSelectedCategory,
  getSelectedLang,
  getCookieState,
  getSelectedStoreTimeZone,
  getStoreOpeningInfo,
  getStoreOpenInDate,
  getUserLanguage,
  getSelectedStoreLoadingFrequency,
} from '../+state/stores.selectors';
import {
  AddOrderItem,
  AddOrderMeta,
  FetchSlots,
  HideCookieMessage,
  SetCurrentSelectedCategory,
  SlotSelected,
  CheckExistingOrder,
  UpdateOrderItem,
  RemoveOrderItem,
  LoadStoreSeveralTimes,
  ClearOrderMeta
} from '../+state/stores.actions';
import { Observable, Subject, forkJoin, from, combineLatest, timer } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocationService } from '../../location.service';
import { Location, DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from '../../helper.service';
import { WINDOW } from '../../window-providers';
import StoreUtils from '../utils/StoreUtils';
import { Slot } from '../types/AvailableSlotsResponse';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DELIVERY_METHOD_VALUES } from '../types/DeliveryMethod';
import { CheckoutService } from '../store-checkout/checkout.service';
import { browserRefresh } from 'src/app/app.component';
import { LocalStorageService } from 'src/app/local-storage.service';

@Component({
  selector: 'app-store-dashboard',
  templateUrl: './store-dashboard.component.html',
  styleUrls: ['./store-dashboard.component.scss']
})
export class StoreDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchCategory') searchCategoryInput: ElementRef;
  @Input() acceptTermVisible = false;

  selectedStore$: Observable<ClientStore>;
  selectedStoreStatus$: Observable<string>;
  selectedStore: ClientStore; // changed from ClientStore to any since image and logo are manually added and not part of ClientStore
  selectedStoreLocale: string;
  selectedStoreCurrency: string;
  selectedStoreCurrencySymbol: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  menuCatalog$: Observable<Category[]>;
  catalog: CatalogList;
  BASKET_ENABLED: string;
  ENABLE_ORDERING: string;
  openTimeSchedule: any;
  selectedLang: string;
  selectedCatalog: number;
  menuCategories: Category[];

  // searchMenuCategoriesOffers: string[] = [];
  // searchMenuCategoriesIndexes: number[][] = [];
  filterResult: number[][] = [];

  selectedCat: number;
  currentCartStatus: string;
  currentCartUuid: string;
  cart$: Observable<OrderItem[]>;
  cartItems: OrderItem[];
  showCookieMessage: boolean;
  showStickyScroll: boolean;
  showStickyCategories: boolean;
  showStickySearchCategories: boolean;
  scrolledIntoView: string;
  scrollingToCurrentCat = false;
  scrollY = 0;
  initialLoad = true;
  scrollDirection: string;
  previouslyExpanded: string = null;
  isPos = false;
  innerHeight = 500;
  catalogLoaded = false;
  userLang$: Observable<string>;
  storeTimeZone$: Observable<string>;
  storeTimezone: string;
  deliveryTime: Slot;
  availableSlots: Slot[];
  showClosedStoreMessage = false;
  fbCode: string;

  isOneClickToAddBasket = false;

  logoBackgrondColor = 'rgba(0,0,0,1)';
  logoBackgrondColorTransparent = 'rgba(0,0,0,0)';
  logoMargin = 90;
  backgroundMargin = 200;
  isDark = true;
  showStickyBasket = false;
  basketHeight = 300;
  basketEnabled = false;

  categorySearch = '';

  @ViewChild('heroHeader') templateHero: ElementRef;
  @ViewChild('noHeroHeader') templateNoHero: ElementRef;
  @ViewChild('navTabWrapper') navTabWrapper: ElementRef;
  @ViewChild('navTabContainer') navTabContainer: ElementRef;
  @ViewChild('myTabContent') myTabContent: ElementRef;
  @ViewChild('openTimeSelectorModal') openTimeModal: ElementRef;
  @ViewChild('scrollableContaner') scrollableContaner: ElementRef;
  @ViewChild('menuCategoryContainer') menuCategoryContainer: ElementRef;
  @ViewChild('menuCategorySearchContainer') menuCategorySearchContainer: ElementRef;
  @ViewChild('basketContainer') basketContainer: ElementRef;
  @ViewChild('basketContent') basketContent: ElementRef;
  @HostListener('window:resize', ['$event'])
  // @HostListener('.overflow-auto:scroll', ['$event'])
  onResize(event) {
    if (this.selectedCat && this.initialLoad) {
      this.initialLoad = false;
      return;
    }
    this.scrollCalc();
    this.calcScrollDirection();
    this.calcTopScroll();
    this.calcScrolledIntoView();
    if (this.scrollableContaner?.nativeElement && this.basketContainer?.nativeElement) {
      this.showStickyBasket = (this.scrollableContaner.nativeElement.scrollTop > this.basketContainer.nativeElement.offsetTop);
      if (this.basketContent?.nativeElement) {
        this.basketHeight =
          this.scrollableContaner.nativeElement.offsetHeight -
          this.basketContent.nativeElement.getBoundingClientRect().top -
          (this.isPos ? 100 : 200);
      }
    }
  }
  constructor(
    private store: Store<SelectedStoreState>,
    private router: Router,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private helper: HelperService,
    private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2,
    public checkoutService: CheckoutService,
    public storageService: LocalStorageService,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: any) {
    this.innerHeight = this.helper.calcInnerHeight();
  }

  ngOnInit() {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    this.showCookieMessage = false;
    this.cartItems = [];
    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.selectedStoreStatus$ = this.store.pipe(
      select(getSelectedStoreStatus)
    );
    this.store.select(getSelectedStoreCatalog)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        this.catalogLoaded = state.status === 'LOADED';
      });
    this.selectedStore$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.selectedStore = value;
        if (this.selectedStore && this.selectedStore.specialSchedules) {
          for (const specialSchedule of this.selectedStore.specialSchedules) {
            if (specialSchedule.type === 'OPENING_HOURS') {
              this.openTimeSchedule = this.processOpenTimeSchedule(specialSchedule.schedule);
            }
          }
        }
        if (this.selectedStore && this.selectedStore.address && this.selectedStore.currency) {
          this.selectedStoreLocale = this.selectedStore.address.country.defaultLocale
            + '-'
            + this.selectedStore.address.country.code;
          this.selectedStoreCurrency = this.selectedStore.currency.isoCode;
          this.selectedStoreCurrencySymbol = this.selectedStore.currency.symbol;
        }
        if (this.selectedStore && this.selectedStore.settings) {
          this.fbCode = this.selectedStore.settings.FACEBOOK_PIXEL_TRACKING_ID;
          this.isOneClickToAddBasket = this.selectedStore.settings.ADD_BASKET_ONE_CLICK;
          this.basketEnabled = this.selectedStore.settings.BASKET_ENABLED;
        }
      });

    combineLatest([this.store.select(getSelectedStoreCatalog), this.store.select(getSelectedCategory)])
      .pipe(
        takeUntil(this.unsubscribe$),
        // filter(([catalog, category]) => catalog.data.catalogId !== -1)
      )
      .subscribe(([catalog, category]) => {
        this.catalog = catalog;
        this.selectedCatalog = catalog.data.catalogId;
        this.menuCategories = catalog.data.categories;
        this.changeDetectorRef.detectChanges(); // not required
        (this.menuCategories && this.menuCategories[0]) ? this.selectedCat = this.menuCategories[0].categoryId : this.selectedCat = -1;
        if (category != null) {
          this.selectedCat = category;
          const calc = timer(320);
          calc.subscribe(_ => { this.scrollCalc(); });
        }

        /*  this.searchMenuCategoriesOffers = []; // Alternate approach for category search
         this.searchMenuCategoriesIndexes = [];
         this.menuCategories.forEach((element, i) => {
           element.offers.forEach((offer, j) => {
             this.searchMenuCategoriesOffers.push(offer.name);
             this.searchMenuCategoriesIndexes.push([i, j]);
           });
         }); */
      },
        err => console.log('Error:', err),
      );

    this.store.select(getSelectedLang)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.selectedLang = value;
      });

    combineLatest([this.store.select(getCurrentCartStatus)
      , this.store.select(getCurrentCartUuid)
      , this.store.select(getCurrentCartContent)
      , this.store.select(getCookieState)
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(results => {
        this.currentCartStatus = results[0];
        switch (results[0]) {
          case 'LOADED':
            this.currentCartUuid = results[1];
            this.cartItems = results[2];
            if (results[0] && results[3]) {
              if (
                (
                  results[3].cookieState.status === 'INITIAL' ||
                  results[3].cookieState.status === 'UNSET'
                ) &&
                (
                  !this.cartItems ||
                  this.cartItems.length === 0
                )
              ) {
                this.showCookieMessage = true;
              } else {
                this.showCookieMessage = false;
              }
            } else {
              this.showCookieMessage = false;
            }
            break;
          case 'ITEMADDED':
          case 'ITEMUPDATED':
          case 'ITEMREMOVED':
            this.store.dispatch(new CheckExistingOrder(this.selectedStore.id, this.currentCartUuid, 'CHECKEXISTING', this.selectedLang));
            break;
        }
      },
        err => console.log('Error:', err),
      );

    this.isPos = this.router.url.includes('/capture/');

    this.userLang$ = this.store.select(getUserLanguage);
    this.storeTimeZone$ = this.store.pipe(takeUntil(this.unsubscribe$), select(getSelectedStoreTimeZone));
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.storeTimeZone$.subscribe((timeZone) => {
      this.storeTimezone = timeZone || browserTimeZone;
    });
    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(getStoreOpeningInfo)
    ).subscribe(storeOpeningInfo => {
      const slots = storeOpeningInfo.slots;
      if (slots.selectedSlot && slots.selectedSlot.startTime !== '') {
        this.deliveryTime = slots.selectedSlot;
        this.availableSlots = slots.availableSlots;
        // Needs to be done in the following order, first 'deliveryMethod' then 'wishTime'
        if (this.selectedStore.settings.DEFAULT_DELIVERY_MODE) {
          if (
            DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE] &&
            this.selectedStore.settings['DELIVERY_' + DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE]]
          ) {
            this.store.dispatch(
              new AddOrderMeta(
                'deliveryMethod',
                DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE]
              )
            );
          } else {
            this.store.dispatch(new AddOrderMeta('deliveryMethod', null));
          }
        }
        this.store.dispatch(new AddOrderMeta('wishTime', dayjs(this.deliveryTime.startTime).toISOString()));
      } else {
        this.deliveryTime = {
          startTime: storeOpeningInfo.date,
          endTime: null,
          totalOrders: 0,
          isDisabled: false
        };
        this.availableSlots = [];
      }

    });

    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(getStoreOpenInDate),
      filter(openInDate => openInDate != null)
    ).subscribe(openInDate => {
      if (!openInDate) {
        this.showClosedStoreMessage = true;
      } else {
        this.showClosedStoreMessage = false;
      }
    });

    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(getSelectedStoreLoadingFrequency)
    ).subscribe(d => {
      if (d && this.checkoutService.ifStoreClosed() && !this.checkoutService.isFutureOrderingEnabled()) {
        this.renderer.removeClass(this.openTimeModal.nativeElement, 'hide');
      }
    });

    if (this.storageService.getSavedState('categorySearch') && !browserRefresh) {
      this.categorySearch = this.storageService.getSavedState('categorySearch');
    }
  }

  ngAfterViewInit() {
    if (this.selectedCat && this.myTabContent) {
      const queryCatNav = this.myTabContent.nativeElement.querySelector(`#category${this.selectedCat}`);
      setTimeout(() => {
        this.scrollToCurrentCat(105);
      }, 90);
    }
  }

  scrollToCurrentCat(offset = 0, toggle = 'off') {
    this.scrollingToCurrentCat = true;
    const subject: Subject<any> = new Subject<any>();
    // scroll to category tab
    if (this.navTabContainer) {
      const queryCatTabNav = this.navTabContainer.nativeElement.querySelector(`#tab${this.selectedCat}`);
      if (queryCatTabNav) {
        this.doScrollingNavCats(this.navTabWrapper.nativeElement
          , 10
          , (queryCatTabNav.offsetLeft - 40)
          , this.navTabWrapper.nativeElement.offsetWidth
          , 'scrollLeft'
          , subject
        );
      }
    }
    // scroll to category content
    const subjectVertical: Subject<any> = new Subject<any>();
    const that = this;
    subjectVertical.subscribe({
      complete() {
        setTimeout(() => { that.scrollingToCurrentCat = false; }, 100);
      }
    }
    );
    if (this.myTabContent) {
      const queryCatsNav = this.myTabContent.nativeElement.querySelectorAll(`.tab-pane`);
      const queryCatNav = this.myTabContent.nativeElement.querySelector(`#category${this.selectedCat}`);
      if (queryCatNav) {
        if (toggle === 'off') {
          queryCatNav.classList.add('expanded');
        }
        if (toggle === 'toggle') {
          queryCatNav.classList.toggle('expanded');
        }
        let offsetSC = 65;
        if (offset === 0 && this.previouslyExpanded === null) {
          offsetSC = 105;
        }
        if (this.isPos) {
          offsetSC += 105;
        }
        this.doScrolling(null
          , 350
          , queryCatNav.getBoundingClientRect().top  // account for the 35px of the top fixed bar
          // , (offset !== 0 ) ? 105 : 65
          // , (offset !== 0 ) ?
          //     offset :
          //     (this.previouslyExpanded === null || (queryCatsNav[1].id === `category${this.selectedCat}` )) ? 105 : 65
          , (offset !== 0)
            ? offset
            : ((queryCatsNav[0] && (queryCatsNav[0].id === this.previouslyExpanded))
              && (queryCatsNav[1] && (queryCatsNav[1].id === `category${this.selectedCat}`))) ? 105 : offsetSC
          , 'scrollFromTop'
          , subjectVertical
        );
        this.previouslyExpanded = `category${this.selectedCat}`;
      }
    }
  }

  calcScrollDirection() {
    if (this.scrollableContaner) {
      if (this.scrollY > this.scrollableContaner.nativeElement.scrollTop) {
        this.scrollDirection = 'up';
      } else {
        this.scrollDirection = 'down';
      }
      this.scrollY = this.scrollableContaner.nativeElement.scrollTop;
    }
  }

  calcTopScroll() {
    let templateHero: ElementRef;
    templateHero = this.templateNoHero === undefined ? this.templateHero : this.templateNoHero;
    if (this.scrollableContaner?.nativeElement && this.menuCategoryContainer?.nativeElement && templateHero?.nativeElement
      && this.menuCategorySearchContainer?.nativeElement) {
      this.showStickyCategories = ((this.scrollableContaner.nativeElement.scrollTop - templateHero.nativeElement.offsetHeight) >=
        (this.menuCategorySearchContainer.nativeElement.offsetHeight));
    }
    if (this.scrollableContaner?.nativeElement && this.menuCategorySearchContainer?.nativeElement && templateHero?.nativeElement) {
      this.showStickySearchCategories = ((this.scrollableContaner.nativeElement.scrollTop - templateHero.nativeElement.offsetHeight) >=
        this.menuCategorySearchContainer.nativeElement.offsetHeight);
    }
  }

  calcScrolledIntoView() {
    let newActiveCatTab = null;
    let activeCatTab = null;
    if (this.navTabContainer) {
      const queryCatTabNav = this.navTabContainer.nativeElement.querySelector(`.active`);
      if (!queryCatTabNav || this.scrollingToCurrentCat) {
        return;
      }
      this.scrolledIntoView = queryCatTabNav.getAttribute('id');
      activeCatTab = this.navTabContainer.nativeElement.querySelector(`.active`);
      let offsetTop = 70;
      if (this.selectedStore.settings.CATALOG_CATEGORIES_COLLAPSE) {
        offsetTop = 90;
      }
      if (this.isPos) {
        offsetTop += 110;
      }
      Array.from(this.myTabContent.nativeElement.children).forEach((child: HTMLElement) => {
        const myClientRect = child.getBoundingClientRect();
        if (myClientRect.top <= offsetTop) {
          newActiveCatTab = this.navTabContainer.nativeElement.querySelector(`#tab${child.children[0].getAttribute('id').slice(8)}`);
        }
      });
    }
    if (newActiveCatTab && activeCatTab && newActiveCatTab.getAttribute('id') !== activeCatTab.getAttribute('id')) {
      this.router.navigateByUrl(
        this.locationService.base_url(`category/${newActiveCatTab.getAttribute('id').replace('tab', '')}`)
      ).then(() => { });
      this.selectedCat = parseInt(newActiveCatTab.getAttribute('id').slice(3), 10);
      this.changeDetectorRef.detectChanges();
      const subject: Subject<any> = new Subject<any>();
      // activeCatTab.classList.remove('active');
      // newActiveCatTab.classList.add('active');
      let offset = 40;
      if (this.selectedStore.settings.CATALOG_CATEGORIES_COLLAPSE) {
        offset = 0;
      }
      this.doScrollingNavCats(this.navTabWrapper.nativeElement
        , 100
        , (this.scrollDirection === 'down') ? (activeCatTab.offsetLeft + offset) : (newActiveCatTab.offsetLeft - offset)
        , this.navTabWrapper.nativeElement.offsetWidth
        , (this.scrollDirection === 'down') ? 'scrollLeft' : 'scrollRight'
        , subject
      );
    }
  }

  onSelectCategory(categoryId, toggle = 'off') {
    this.hideCookieMessage();
    this.selectedCat = categoryId;
    this.scrollToCurrentCat(0, toggle);
    this.store.dispatch(new SetCurrentSelectedCategory(categoryId));
    this.router.navigateByUrl(this.locationService.base_url(`category/${categoryId}`)).then(() => {
    });
  }

  viewProductDetails(offerId, categoryId, inStock, isExpandable, isOrderable, BASKET_ENABLED) {
    if (!inStock || (!isExpandable && (!isOrderable || !BASKET_ENABLED))) {
      return;
    }

    this.store.dispatch(new SetCurrentSelectedCategory(categoryId));
    this.hideCookieMessage();
    this.router.navigateByUrl(this.locationService.base_url(`category/${categoryId}`)).then(() => {
      this.router.navigateByUrl(this.locationService.base_url(`offer/${offerId}`));
    });
  }

  // cartItemsTotalValue() {
  //   let ret = 0;
  //   if (this.cartItems) {
  //     this.cartItems.forEach( item => {
  //       ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
  //       if (item.childOrderItems) {
  //         ret += item.childOrderItems.reduce((price, orderItem) => price + orderItem.totalNonDiscountedPrice, 0);
  //       }
  //     });
  //   }

  //   return ret;
  // }

  // as per Skype discussion (02.04.2020) BE is sending calculated totalDiscountedPrice and totalNonDiscountedPrice
  // for the WHOLE ORDER ITEM so no need to add on the price and qty for child order items
  cartItemsTotalValue() {
    let ret = 0;
    if (this.cartItems) {
      this.cartItems.forEach(item => {
        ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
      });
    }

    return ret;
  }

  OnViewOrder(event) {
    event.preventDefault();
    this.store.dispatch(new SetCurrentSelectedCategory(this.selectedCat));
    this.router.navigateByUrl(this.locationService.base_url(`cart`));
  }

  getBackgroundImage(url) {
    if (url) {
      return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
    }
    return '';
  }

  // scrolling
  scrollCalc() {
    this.showStickyScroll = this.helper.scrollCalc(this.scrollableContaner);
    this.innerHeight = this.helper.calcInnerHeight();
  }

  scrollPage() {
    this.helper.scrollPage(this.scrollableContaner);
    this.hideCookieMessage();
  }

  scrollCategoriesWrapper(direction) {
    this.hideCookieMessage();
    const subject: Subject<any> = new Subject<any>();
    this.doScrolling(this.navTabWrapper.nativeElement, 700, 500, this.navTabWrapper.nativeElement.offsetWidth, direction, subject);
  }

  doScrolling(elementY, duration, scrollBy, offset, direction: 'scrollLeft' | 'scrollRight' | 'scrollFromTop', subject: Subject<any>) {
    if (this.scrollableContaner) {
      const scrollableContaner = this.scrollableContaner.nativeElement;
      const w = this.window;
      let startingY = 0;
      if (elementY != null) {
        startingY = elementY.scrollLeft;
      } else {
        startingY = scrollableContaner.scrollTop;
        scrollBy -= offset;
      }
      let start;
      w.requestAnimationFrame(function step(timestamp) {
        start = (!start) ? timestamp : start;

        const time = timestamp - start;
        const percent = Math.min(time / duration, 1);
        switch (direction) {
          case 'scrollLeft':
            elementY.scrollLeft = startingY + Math.floor(scrollBy * percent);
            break;
          case 'scrollRight':
            elementY.scrollLeft = startingY - Math.floor(scrollBy * percent);
            break;
          case 'scrollFromTop':
            if (!!scrollableContaner) {
              scrollableContaner.scroll(0, startingY + Math.floor(scrollBy * percent));
            } else {
              w.scroll(0, startingY + Math.floor(scrollBy * percent));
            }
            break;
          default:  // scroll right
            elementY.scrollLeft = startingY - Math.floor(scrollBy * percent);
            break;
        }

        if (time < duration) {
          w.requestAnimationFrame(step);
          subject.next({});
        } else {
          subject.complete();
        }
      });
    }
  }

  doScrollingNavCats(
    elementY,
    duration,
    scrollBy,
    maxRight,
    direction: 'scrollLeft' | 'scrollRight' | 'scrollFromTop',
    subject: Subject<any>
  ) {
    const w = this.window;
    const scrollableContaner = this.scrollableContaner.nativeElement;
    let startingY = 0;
    let targetY = 0;
    if (elementY != null) {
      startingY = elementY.scrollLeft;
      targetY = scrollBy - startingY;
    } else {
      startingY = scrollableContaner.scrollTop;
    }
    let start;
    w.requestAnimationFrame(function step(timestamp) {
      start = (!start) ? timestamp : start;

      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);
      switch (direction) {
        case 'scrollLeft':
          elementY.scrollLeft = startingY + Math.floor(targetY * percent);
          break;
        case 'scrollRight':
          elementY.scrollLeft = startingY + Math.floor(targetY * percent);
          break;
      }

      if (time < duration) {
        w.requestAnimationFrame(step);
        subject.next({});
      } else {
        subject.complete();
      }
    });
  }

  hideCookieMessage() {
    if (this.showCookieMessage && !this.fbCode) {
      this.store.dispatch(new HideCookieMessage());
    }
  }

  getCatAnimation(cat) {
    if (!cat || !cat.offers || cat.offers.length === 0) {
      return '';
    }
    if (cat.offers.length < 4) {
      return 'ultra-fast';
    }
    if (cat.offers.length < 11) {
      return 'fast';
    }
    if (cat.offers.length < 18) {
      return 'medium';
    }
    if (cat.offers.length < 27) {
      return 'slow';
    }
    if (cat.offers.length < 36) {
      return 'ultra-slow';
    }
    return 'x-ultra-slow';
  }

  processOpenTimeSchedule(schedule) {
    const availabitity = schedule.availabilities;
    const result = {
      MON: {
        title: 'public.global.days.mon',
        items: []
      },
      TUE: {
        title: 'public.global.days.tue',
        items: []
      },
      WED: {
        title: 'public.global.days.wed',
        items: []
      },
      THU: {
        title: 'public.global.days.thu',
        items: []
      },
      FRI: {
        title: 'public.global.days.fri',
        items: []
      },
      SAT: {
        title: 'public.global.days.sat',
        items: []
      },
      SUN: {
        title: 'public.global.days.sun',
        items: []
      }
    };
    const storeTimezone = this.selectedStore.timeZone;
    const now = new Date();
    const storeTime = new Date(now.toLocaleString('en-US', { timeZone: storeTimezone }));
    let storeTimeDiff = 0;
    if (!isNaN(storeTime.getTime())) {
      storeTimeDiff = now.getTime() - storeTime.getTime();
    }

    availabitity.map((item) => {
      const startTime = new Date('2000-01-01T' + item.startTime + 'Z');
      startTime.setTime(startTime.getTime() + storeTimeDiff);
      const endTime = new Date('2000-01-01T' + item.endTime + 'Z');
      endTime.setTime(endTime.getTime() + storeTimeDiff);
      if (item.daysOfWeek) {
        for (const dayOfWeek of item.daysOfWeek) {
          result[dayOfWeek].items.push({
            startTime: startTime.toISOString().substr(11, 5),
            endTime: endTime.toISOString().substr(11, 5),
          });
        }
      } else if (!item.date) {
        for (const day of Object.keys(result)) {
          result[day].items.push({
            startTime: startTime.toISOString().substr(11, 5),
            endTime: endTime.toISOString().substr(11, 5),
          });
        }
      }
    });

    return Object.values(result);
  }

  OnOpenTimeModal(event) {
    event.preventDefault();
    this.renderer.removeClass(this.openTimeModal.nativeElement, 'hide');
  }

  OnCheckOutsideClose() {
    this.renderer.addClass(this.openTimeModal.nativeElement, 'hide');
    this.store.dispatch(new LoadStoreSeveralTimes());
  }

  isAllergenSeleted(attributes, name) {
    const attr = attributes.find(item => item.key === name);
    return attr ? attr.value : false;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  shouldDisplayDateSelection(): boolean {
    return this.selectedStore.settings.DELIVERY_REQUEST_ORDER_DATE_UPFRONT && this.selectedStore.settings.DEFAULT_DELIVERY_MODE;
  }

  shouldDisplaySlotSelection(): boolean {
    return !StoreUtils.isAsapOrderEnabled(this.selectedStore, this.selectedStore.settings.DEFAULT_DELIVERY_MODE);
  }

  private isToday(date: Dayjs): boolean {
    const comparisonTemplate = 'YYYY-MM-DD';
    const now = dayjs();
    return date.format(comparisonTemplate) === now.format(comparisonTemplate);
  }

  onDateChanged(date: Slot) {
    this.deliveryTime = date;

    if (
      DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE] &&
      this.selectedStore.settings['DELIVERY_' + DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE]]
    ) {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE]));
    } else {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', null));
    }
    this.store.dispatch(
      new FetchSlots(
        this.selectedStore.id,
        this.selectedStore.settings.DEFAULT_DELIVERY_MODE,
        this.deliveryTime.startTime
      )
    );
  }

  onSelectedSlotChanged(selectedSlot: Slot) {
    this.deliveryTime = selectedSlot;
    // Needs to be done in the following order, first 'deliveryMethod' then 'wishTime'
    if (
      DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE] &&
      this.selectedStore.settings['DELIVERY_' + DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE]]
    ) {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', DELIVERY_METHOD_VALUES[this.selectedStore.settings.DEFAULT_DELIVERY_MODE]));
    } else {
      this.store.dispatch(new AddOrderMeta('deliveryMethod', null));
    }
    if (!this.deliveryTime.startTime) { return; }
    this.store.dispatch(new AddOrderMeta('wishTime', dayjs(this.deliveryTime.startTime).toISOString()));
    this.store.dispatch(new SlotSelected(selectedSlot));
  }

  onCalcLogoColor(event) {
    try {
      this.logoMargin = Math.round((event.target.height + 10) * 0.75);
      this.backgroundMargin = event.target.width + 200;
      const { r, g, b } = this.analyse(event.target, 10);
      this.logoBackgrondColor = `rgba(${r},${g},${b},1)`;
      this.logoBackgrondColorTransparent = `rgba(${r},${g},${b},0)`;

      const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      this.isDark = (brightness < 128);
    } catch (e) {
      console.error(e);
    }
  }

  analyse(img, border) {
    const canvas = document.createElement('canvas');  // create a canvas element
    const ctx = canvas.getContext('2d');              // get context
    const w = img.naturalWidth;                       // get actual width..
    const h = img.naturalHeight;

    canvas.width = w;                               // set canvas size
    canvas.height = h;

    ctx.drawImage(img, 0, 0);                       // draw in image

    // do checks:, for example:
    // if (border*2 > canvas.width || border*2 > canvas.height) throw "Image too small!";

    // get borders, avoid overlaps (though it does not really matter in this case):
    const top = ctx.getImageData(0, 0, w, border).data;
    const left = ctx.getImageData(0, border, border, h - border * 2).data;
    const right = ctx.getImageData(w - border, border, border, h - border * 2).data;
    const bottom = ctx.getImageData(0, h - border, w, border).data;

    let r = 0;
    let g = 0;
    let b = 0;
    let cnt = 0;

    // count pixels and add up color components: (see function below)
    countBuffer(top);
    countBuffer(left);
    countBuffer(right);
    countBuffer(bottom);

    // calc average
    r = Math.round(r / cnt);
    g = Math.round(g / cnt);
    b = Math.round(b / cnt);

    return { r, g, b };

    function countBuffer(data) {
      let i = 0;
      const len = data.length;
      while (i < len) {
        r += data[i++];   // add red component etc.
        g += data[i++];
        b += data[i++];
        i++;
        cnt++;            // count one pixel
      }
    }

  }

  isTimeShowDisabled() {
    if (!this.selectedStore || !this.selectedStore.settings) {
      return false;
    }
    switch (this.selectedStore.settings.DEFAULT_DELIVERY_MODE) {
      case 'IN_STORE_LOCATION':
        return this.selectedStore.settings.DELIVERY_IN_STORE_LOCATION_HIDE_FUTURE_WISH_DATE;
      case 'NO_LOCATION':
        return this.selectedStore.settings.DELIVERY_NO_LOCATION_HIDE_FUTURE_WISH_DATE;
      case 'ADDRESS':
        return this.selectedStore.settings.DELIVERY_ADDRESS_HIDE_FUTURE_WISH_DATE;
    }
    return false;
  }

  onOneClickAddToCart(event, offerId, categoryId, inStock, isDirectlyOrderable, isExpandable, isOrderable, BASKET_ENABLED) {
    event.stopPropagation();
    if (
      !this.selectedStore.settings.ADD_BASKET_ONE_CLICK ||
      !isDirectlyOrderable ||
      !isOrderable ||
      !BASKET_ENABLED ||
      !inStock ||
      this.checkoutService.ifStoreClosed()
    ) {
      this.viewProductDetails(offerId, categoryId, inStock, isExpandable, isOrderable, BASKET_ENABLED);
      return;
    }
    this.store.dispatch(new AddOrderItem(this.selectedStore.id, this.currentCartUuid, {
      offerId,
      quantity: 1,
      comment: '',
      childItemRequests: []
    }));
  }
  onDecreaseItemQty(event, item) {
    event.stopPropagation();
    if (this.currentCartStatus !== 'LOADED') {
      return;
    }
    if (item.quantity > 1) {
      let childItemRequests = [];
      if (item.childOrderItems) {
        childItemRequests = item.childOrderItems.map((oItem) => ({ offerId: oItem.offerId, quantity: oItem.quantity }));
      }
      item.quantity -= 1;
      if (item.variantOfferId) {
        childItemRequests.push({ offerId: item.variantOfferId, quantity: item.quantity });
      }
      this.store.dispatch(new UpdateOrderItem(this.selectedStore.id, this.currentCartUuid, item.uuid, {
        childItemRequests,
        comment: item.comment,
        offerId: item.offerId,
        quantity: item.quantity,
      }));
    } else {
      item.quantity -= 1;
      this.store.dispatch(new RemoveOrderItem(this.selectedStore.id, this.currentCartUuid, item.uuid));
    }
  }
  onIncreaseItemQty(event, item) {
    event.stopPropagation();
    let childItemRequests = [];
    if (this.currentCartStatus !== 'LOADED') {
      return;
    }
    if (item.childOrderItems) {
      childItemRequests = item.childOrderItems.map((oItem) => ({ offerId: oItem.offerId, quantity: oItem.quantity }));
    }
    item.quantity += 1;
    if (item.variantOfferId) {
      childItemRequests.push({ offerId: item.variantOfferId, quantity: item.quantity });
    }
    this.store.dispatch(new UpdateOrderItem(this.selectedStore.id, this.currentCartUuid, item.uuid, {
      childItemRequests,
      comment: item.comment,
      offerId: item.offerId,
      quantity: item.quantity,
    }));
  }
  checkOfferInCart(menuItem) {
    if (!this.cartItems) {
      return {};
    }
    return { item: this.cartItems.find((item) => item.offerId === menuItem.offerId) };
  }
  viewOrderItemDetails(item: OrderItem) {
    // check if the orderUuid is in fact a store promo rule
    // if yes, then do nothing
    if (item.hierarchyLevel !== 'PARENT') {
      return;
    }
    this.router.navigateByUrl(this.locationService.base_url(`orderItem/${item.uuid}`));
  }
  shouldDisplaySiblingSelection() {
    return this.selectedStore &&
      this.selectedStore.relation &&
      this.selectedStore.relation.siblingStores.filter(sibling => !sibling.isIndependent).length > 0;
  }
  scrollExist() {
    return this.helper.scrollCalc(this.scrollableContaner);
  }

  onKeypressSearchCategory(event: any) {
    this.categorySearch = event.target.value.trim();
    this.storageService.setSavedState(this.categorySearch, 'categorySearch');
    /*if (this.categorySearch === "") { // Alternate approach for category search
      this.filterResult.forEach(item => {
        this.menuCategories[item[0]].offers[item[1]].display = false
      })
    } else {
      const a = []
      this.searchMenuCategoriesIndexes.forEach((e, i) => {
        const categoyIndex = this.searchMenuCategoriesIndexes[i];
        if (this.searchMenuCategoriesOffers[i].toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase())) {
          a.push(this.searchMenuCategoriesOffers[i])
          this.menuCategories[categoyIndex[0]].offers[categoyIndex[1]].display = true;
          this.filterResult.push(categoyIndex);
        } else {
          this.menuCategories[categoyIndex[0]].offers[categoyIndex[1]].display = false;
        }
      });
    }*/

  }

  checkCategorySearchFilter(items) {
    if (items) {
      return items.filter(menuItem => menuItem.name && this.categorySearch
        && menuItem.name.toLocaleLowerCase().includes(this.categorySearch.toLocaleLowerCase())).length > 0;
    }
    else {
      return;
    }
  }

  clearSearchCategory() {
    this.categorySearch = '';
  }
}
