import { BasketEnabledGuard } from './basket-enabled.guard';
import { AdminBasketEnabledGuard } from './admin-basket-enabled.guard';
import { AdminStoreLoadingGuard } from './admin-store-loading.guard';
import { LayoutModule } from './../layout/layout.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

import {TranslateLoader, TranslateModule, TranslateParser} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';

import { PublicRoutingModule } from './public-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreLoadingComponent } from './store/store-loading/store-loading.component';
import { StoreDashboardComponent } from './store/store-dashboard/store-dashboard.component';
import { StoreItemDetailsComponent } from './store/store-item-details/store-item-details.component';
import { StoreCheckoutComponent } from './store/store-checkout/store-checkout.component';
import { StoreCheckoutPaymentComponent } from './store/store-checkout/store-checkout-payment/store-checkout-payment.component';
import { StoreModule } from '@ngrx/store';
import {
  selectedStoresReducer,
  selectedStoreInitialState,
  catalogInitialState,
  cartInitialState,
  cartStateReducer,
  viewStateReducer,
  viewInitialState,
  offerItemStateReducer,
  offerItemInitialState,
  orderMetaDataReducer,
  orderMetaInitialState,
  errorReducer,
  errorInitialState,
  OrderStatusInitialState,
  orderStatusReducer,
  storeLocationsReducer,
  storeLocationInitialState,
  orderEmailInitialState,
  orderEmailReducer,
  checkoutStateReducer,
  checkoutInitialState,
  cookieStateReducer,
  cookieInitialState,
  zoneStateReducer,
  zoneInitialState,
  currentCatStateReducer,
  currentCatInitialState,
  storeRulesReducer,
  storeRulesInitialState,
  socialLoginReducer,
  socialLoginInitialState,
  customerDetailsUpdateReducer,
  customerDetailsUpdateInitialState,
} from './store/+state/stores.reducer';
import { EffectsModule } from '@ngrx/effects';
import { SelectedStoresEffects } from './store/+state/stores.effects';
import { storesCatalogReducer } from './store/+state/stores.reducer';
import { StoreThankYouComponent } from './store/store-thank-you/store-thank-you.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { PaymentStoresEffects } from './payments/+state/payment.effects';
import {
  paypalStateReducer,
  paypalInitialState,
  stripeStateReducer,
  stripeInitialState,
  idealStateReducer,
  idealInitialState,
  bancontactStateReducer,
  bancontactInitialState,
  vivaStateReducer,
  vivaInitialState,
  digitalWalletsStateReducer,
  digitalWalletsInitialState,
  paymentSenseStateReducer,
  paymentSenseInitialState,
  rmsStateReducer,
  rmsInitialState,
  trustPaymentsStateReducer,
  trustPaymentsInitialState,
  jccStateReducer,
  jccInitialState
} from './payments/+state/payment.reducer';
import { LocationService } from './location.service';
import { StoreErrorComponent } from './store/store-error/store-error.component';
import { StoreCatalogLanguageSelectorComponent } from './store/store-catalog-language-selector/store-catalog-language-selector.component';
import { StoreEmptyCartComponent } from './store/store-empty-cart/store-empty-cart.component';
import { FormatPrice } from '../shared/format-price.pipe';
import { StoreCheckoutDeliveryComponent } from './store/store-checkout/store-checkout-delivery/store-checkout-delivery.component';
import { StoreCheckoutYourInformationComponent } from './store/store-checkout/store-checkout-your-information/store-checkout-your-information.component';
import {
  StoreCheckoutSpecialNoteComponent
} from './store/store-checkout/store-checkout-special-note/store-checkout-special-note.component';
import { CheckoutService } from './store/store-checkout/checkout.service';
import { StoreCheckoutDeliveryAtLocationComponent } from './store/store-checkout/store-checkout-delivery-at-location/store-checkout-delivery-at-location.component';
import { SharedModule } from '../shared/shared.module';
import { CustomParser } from '../translate.parser';
import {
  StoreCheckoutOrderWishTimePanelComponent
} from './store/store-checkout/store-checkout-order-wish-time-panel/store-checkout-order-wish-time-panel.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TextMaskModule } from 'angular2-text-mask';
import { StoreCheckoutPromotionComponent } from './store/store-checkout/store-checkout-promotion/store-checkout-promotion.component';
import { StoreCheckoutFeeRulesComponent } from './store/store-checkout/store-checkout-fee-rules/store-checkout-fee-rules.component';
import { OfferUnavailableDialogComponent } from './store/store-checkout/offer-unavailable-dialog/offer-unavailable-dialog.component';
import { OfferOutofstockDialogComponent } from './store/store-checkout/offer-outofstock-dialog/offer-outofstock-dialog.component';
import {
  StoreCheckoutVoucherCodeComponent
} from './store/store-checkout/store-checkout-voucher-code/store-checkout-voucher-code.component';
import { UnavailableSlotDialogComponent } from './store/store-checkout/unavailable-slot-dialog/unavailable-slot-dialog.component';
import { SameDayOrderingDialogComponent } from './store/store-checkout/same-day-ordering-dialog/same-day-ordering-dialog.component';
import { StoreCheckoutOrderTimeSelectorComponent } from './store/store-checkout/store-checkout-order-time-selector/store-checkout-order-time-selector.component';
import {
  StoreCheckoutErrorDialogComponent
} from './store/store-checkout/store-checkout-error-dialog/store-checkout-error-dialog.component';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApplicationStateModule } from '../application-state/application-state.module';
import { StoreSiblingSelectorComponent } from './store/store-sibling-selector/store-sibling-selector.component';

@NgModule({
  declarations: [
    StoreLoadingComponent,
    StoreDashboardComponent,
    StoreItemDetailsComponent,
    StoreCheckoutComponent,
    StoreCheckoutPaymentComponent,
    StoreThankYouComponent,
    StoreErrorComponent,
    StoreCatalogLanguageSelectorComponent,
    StoreEmptyCartComponent,
    StoreCheckoutDeliveryComponent,
    StoreCheckoutYourInformationComponent,
    StoreCheckoutSpecialNoteComponent,
    StoreCheckoutDeliveryAtLocationComponent,
    StoreCheckoutOrderWishTimePanelComponent,
    StoreCheckoutPromotionComponent,
    StoreCheckoutFeeRulesComponent,
    OfferUnavailableDialogComponent,
    OfferOutofstockDialogComponent,
    StoreCheckoutVoucherCodeComponent,
    UnavailableSlotDialogComponent,
    SameDayOrderingDialogComponent,
    StoreCheckoutOrderTimeSelectorComponent,
    StoreCheckoutErrorDialogComponent,
    StoreSiblingSelectorComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    PublicRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    ApplicationStateModule,
    StoreModule.forFeature('selectedStore', selectedStoresReducer, {initialState: selectedStoreInitialState}),
    StoreModule.forFeature('selectedStoreCatalog', storesCatalogReducer, {initialState: catalogInitialState}),
    StoreModule.forFeature('currentOfferItem', offerItemStateReducer, {initialState: offerItemInitialState}),
    StoreModule.forFeature('currentCartState', cartStateReducer, {initialState: cartInitialState}),
    StoreModule.forFeature('currentStoreViewState', viewStateReducer, {initialState: viewInitialState}),
    StoreModule.forFeature('currentOrderMetaState', orderMetaDataReducer, {initialState: orderMetaInitialState}),
    StoreModule.forFeature('currentPaypalState', paypalStateReducer, {initialState: paypalInitialState}),
    StoreModule.forFeature('currentStripeState', stripeStateReducer, {initialState: stripeInitialState}),
    StoreModule.forFeature('currentIdealState', idealStateReducer, {initialState: idealInitialState}),
    StoreModule.forFeature('currentBancontactState', bancontactStateReducer, {initialState: bancontactInitialState}),
    StoreModule.forFeature('currentVivaState', vivaStateReducer, {initialState: vivaInitialState}),
    StoreModule.forFeature('currentDigitalWalletsState', digitalWalletsStateReducer, {initialState: digitalWalletsInitialState}),
    StoreModule.forFeature('errorState', errorReducer, {initialState: errorInitialState}),
    StoreModule.forFeature('orderStatus', orderStatusReducer, {initialState: OrderStatusInitialState}),
    StoreModule.forFeature('validateStoreLocation', storeLocationsReducer, {initialState: storeLocationInitialState}),
    StoreModule.forFeature('orderEmailStatus', orderEmailReducer, {initialState: orderEmailInitialState}),
    StoreModule.forFeature('checkoutState', checkoutStateReducer, {initialState: checkoutInitialState}),
    StoreModule.forFeature('cookieState', cookieStateReducer, {initialState: cookieInitialState}),
    StoreModule.forFeature('zoneState', zoneStateReducer, {initialState: zoneInitialState}),
    StoreModule.forFeature('currentCatState', currentCatStateReducer, {initialState: currentCatInitialState}),
    StoreModule.forFeature('storeRulesState', storeRulesReducer, {initialState: storeRulesInitialState}),
    StoreModule.forFeature('socialLoginState', socialLoginReducer, {initialState: socialLoginInitialState}),
    StoreModule.forFeature('customerDetailsUpdateState', customerDetailsUpdateReducer, {initialState: customerDetailsUpdateInitialState}),
    StoreModule.forFeature('currentPaymentsenseState', paymentSenseStateReducer, {initialState: paymentSenseInitialState}),
    StoreModule.forFeature('currentRMSState', rmsStateReducer, {initialState: rmsInitialState}),
    StoreModule.forFeature('currentTrustPaymentsState', trustPaymentsStateReducer, {initialState: trustPaymentsInitialState}),
    StoreModule.forFeature('currentJCCState', jccStateReducer, {initialState: jccInitialState}),
    EffectsModule.forFeature([SelectedStoresEffects]),
    EffectsModule.forFeature([PaymentStoresEffects]),
    HttpClientModule,
    TranslateModule.forChild({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        },
        parser: {provide: TranslateParser, useClass: CustomParser},
        isolate: true
    }),
    SharedModule,
    TimepickerModule.forRoot(),
    TextMaskModule,
  ],
  providers: [
    CookieService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: MAT_DATE_LOCALE, useValue: 'en-US'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    LocationService,
    CheckoutService,
    FormatPrice,
    BasketEnabledGuard,
    AdminBasketEnabledGuard,
    AdminStoreLoadingGuard,
  ],
})
export class PublicModule {
  constructor() {
    // detecting language
    document.documentElement.lang = window.navigator.language.split('-')[0];
  }
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
