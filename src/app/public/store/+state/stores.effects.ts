import { switchMap, map, catchError, withLatestFrom, mergeMap, filter, take, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { StoreService } from '../store.service';
import { UIError } from '../types/UIError';
import {
  StoreActionType,
  LoadStore,
  LoadStoreSuccess,
  LoadStoreFailed,
  LoadCatalog,
  LoadCatalogSuccess,
  LoadCatalogFailed,
  InitializeOrder,
  InitializeOrderSuccess,
  CheckExistingOrder,
  CheckExistingOrderSuccess,
  AddOrderItem,
  AddRuleOrderItem,
  ViewOrderItem,
  ViewOrderItemSuccess,
  AddOrderItemSuccess,
  AddRuleOrderItemSuccess,
  RemoveOrderItem,
  RemoveOrderItemSuccess,
  OrderUpdateStatus,
  OrderUpdateStatusSuccess,
  OrderUpdate,
  OrderUpdateSuccess,
  OrderUpdateStatusFailed,
  LoadCatalogLanguages,
  LoadCatalogLanguagesSuccess,
  LoadCatalogLanguagesFailed,
  ErrorMessage,
  UpdateOrderItemSuccess,
  UpdateOrderItem,
  ViewOrderStatusSuccess,
  ViewOrderStatusFailed,
  ValidateStoreLocations,
  ValidateStoreLocationsFail,
  ValidateStoreLocationsSuccess,
  SendOrderByEmail,
  SendOrderByEmailFail,
  SendOrderByEmailSuccess,
  SubmitOrderSuccess,
  GetZonePerZipcode,
  GetZonePerZipcodeFail,
  GetZonePerZipcodeSuccess,
  GetStoreRules,
  GetStoreRulesFail,
  GetStoreRulesSuccess,
  SubmitOrder,
  ErrorMessages,
  ToggleOffersUnavailable,
  UpdateOrderItemQuantities,
  UpdateOrderItemQuantitiesFailed,
  UpdateOrderItemQuantitiesSuccess,
  ToggleOffersOutOfStock,
  ValidateVoucher,
  ValidateVoucherSuccess,
  ValidateVoucherFailed,
  UpdateVoucher,
  RemoveVoucher,
  SubmitOrderFailed,
  FetchSlots,
  FetchSlotsFailed,
  FetchSlotsSuccess,
  ToggleUnavailableDeliveryTimeError,
  UpdateOrderWishTime,
  UpdateOrderWishTimeSuccess,
  UpdateOrderWishTimeFailed,
  UpdateOrderWish,
  ToggleSameDayOrderingDisabled,
  RemoveRuleOrderItemSuccess,
  RemoveRuleOrderItem,
  UpdateDeliveryMethod,
  UpdateZipCode,
  ToggleOrderSubmitError,
  SelectCatalogLanguage,
  SocialLogin,
  SocialLoginFailed,
  SocialLoginSuccess,
  CustomerDetailsUpdate,
  CustomerDetailsUpdateSuccess,
  CustomerDetailsUpdateFailed,
  GeocodeAddress,
  GeocodeAddressSuccess,
  GeocodeAddressFailed,
  GetAssociatedZone,
  GetAssociatedZoneSuccess,
  AddOrderMeta,
  AddCheckoutState,
  ClearOrderMeta,
} from './stores.actions';
import { EMPTY, Observable, of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
  getCurrentCartStatus,
  getCurrentCartUuid,
  getCurrentOrderDeliveryMethod,
  getCurrentOrderMetaState,
  getCurrentOrderWishTime,
  getSelectedLang,
  getSelectedStore,
  getStoreLocationsState,
  getStoreOpeningInfo,
} from './stores.selectors';
import { UnavailableOffer } from '../types/UnavailableOffer';
import { OutOfStockOffer } from '../types/OutOfStockOffer';
import { SameDayOrderingError } from '../types/SameDayOrderingError';
import OrderUtils from '../utils/OrderUtils';
import { DELIVERY_METHODS } from '../types/DeliveryMethod';
import dayjs from 'dayjs';
import { LogService } from '../../../shared/logging/LogService';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import {
  CreateJCCRequestJSON,
  CreatePaymentsenseToken,
  CreateRMSRequestJSON,
 } from '../../payments/+state/payment.actions';
import {
  CheckoutService,
  PAYMENT_METHOD
 } from '../store-checkout/checkout.service';

@Injectable()
export class SelectedStoresEffects {

  constructor(
    private actions$: Actions,
    private storeService: StoreService,
    private store: Store<any>,
    public checkoutService: CheckoutService,
    private logger: LogService,
  ) { }

  @Effect()
  socialLogin = this.actions$.pipe(
    ofType<SocialLogin>(StoreActionType.SocialLogin),
    switchMap(action => this.storeService.socialLogin(action.login).pipe(
      map((res) => new SocialLoginSuccess(res)),
      catchError(() => of(new SocialLoginFailed()))
    ))
  );

  @Effect()
  customerDetailsUpdate = this.actions$.pipe(
    ofType<CustomerDetailsUpdate>(StoreActionType.CustomerDetailsUpdate),
    switchMap(action => this.storeService.customerDetailsUpdate(action.customerDetails).pipe(
      map((res) => new CustomerDetailsUpdateSuccess(res)),
      catchError(() => of(new CustomerDetailsUpdateFailed()))
    ))
  );

  @Effect()
  onLoadStore = this.actions$.pipe(
    ofType<LoadStore>(StoreActionType.LoadStore),
    switchMap(action => this.storeService.load(action.storeAlias).pipe(
      mergeMap((s) => [
        new LoadStoreSuccess(s),
        new ClearOrderMeta({})
      ]),
      catchError((err) => of(new LoadStoreFailed(), new ErrorMessage('public.global.errorExpected', '100', [], err)))
    ))
  );

  @Effect()
  onLoadCatalog = this.actions$.pipe(
    ofType<LoadCatalog>(StoreActionType.LoadCatalog),
    switchMap(action => this.storeService.getcatalog(action.id, action.selectedLang, action.referenceTime).pipe(
      map(s => new LoadCatalogSuccess(s, action.selectedLang)),
      catchError(() => of(new LoadCatalogFailed()))
    ))
  );

  @Effect()
  onLoadCatalogLanguages = this.actions$.pipe(
    ofType<LoadCatalogLanguages>(StoreActionType.LoadCatalogLanguages),
    switchMap(action => this.storeService.getAvailableLanguages(action.storeId).pipe(
      map(s => new LoadCatalogLanguagesSuccess(s, action.storeId)),
      catchError(() => of(new LoadCatalogLanguagesFailed()))
    ))
  );

  // offer item effects
  @Effect()
  onViewOrderItem = this.actions$.pipe(
    ofType<ViewOrderItem>(StoreActionType.ViewOrderItem),
    switchMap(action => this.storeService.retrieveOfferItem(action.storeId, action.catalogId, action.offerId, action.locale).pipe(
      map(s => new ViewOrderItemSuccess(s)),
      // catchError(a => of(new ViewOrderItemFailed()))
      catchError((err) => of(new ErrorMessage('public.global.errorExpected', '200', [], err)))
    ))
  );

  // order effects
  @Effect()
  onInitializeOrder = this.actions$.pipe(
    ofType<InitializeOrder>(StoreActionType.InitializeOrder),
    switchMap(action => this.storeService.initializeEmptyOrder(action.storeId, action.payload).pipe(
      map(s => new InitializeOrderSuccess(s)),
      // catchError(a => of(new InitializeOrderFailed()))
      catchError((err) => of(new ErrorMessage('public.global.errorExpected', '201', [], err)))
    ))
  );

  @Effect()
  onSelectCatalogLanguage = this.actions$.pipe(
    ofType<SelectCatalogLanguage>(StoreActionType.SelectCatalogLanguage),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState)
    ),
    filter(([action, clientStore, orderUuid, orderMeta, validLocations]) => !!orderUuid),
    map(([action, clientStore, orderUuid, orderMeta, validLocations]) => {
      const orderUpdateRequest =
        OrderUtils.mapOrderMetadataToOrderUpdateRequest(
          orderMeta.data,
          clientStore,
          validLocations,
          action.selectedLanguage
        );
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest);
    })
  );

  @Effect()
  onCheckExistingOrder = this.actions$.pipe(
    ofType<CheckExistingOrder>(StoreActionType.CheckExistingOrder),
    switchMap(action => this.storeService.checkExistingOrder(action.storeId, action.orderUuid, action.locale).pipe(
      map(s => new CheckExistingOrderSuccess(s)),
      catchError((err) => of(new ErrorMessage('public.global.errorExpected', '202', [], err)))
    ))
  );

  @Effect()
  onCheckExistingOrderSuccess = this.actions$.pipe(
    ofType<CheckExistingOrderSuccess>(StoreActionType.CheckExistingOrderSuccess),
    filter(action => !!action.order.location),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, selectedStore]) => this.storeService.validateStoreLocation(selectedStore.id, action.order.location.toString()).pipe(
      map(s => new ValidateStoreLocationsSuccess(s)),
      catchError(() => of(new ValidateStoreLocationsFail()))
    ))
  );

  @Effect()
  onAddOrderItem = this.actions$.pipe(
    ofType<AddOrderItem>(StoreActionType.AddOrderItem),
    switchMap(action => this.storeService.addOrderItem(action.storeId, action.uuid, action.orderItem).pipe(
        map(s => new AddOrderItemSuccess(s)),
        // catchError(a => of(new AddOrderItemFailed()))
        catchError((err) => of(new ErrorMessage('public.global.errorExpected', '203', [], err)))
      )
    )
  );

  @Effect()
  AddRuleOrderItem = this.actions$.pipe(
    ofType<AddRuleOrderItem>(StoreActionType.AddRuleOrderItem),
    switchMap(action => this.storeService.addOrderItem(action.storeId, action.uuid, action.orderItem).pipe(
        map(s => new AddRuleOrderItemSuccess(s)),
        // catchError(a => of(new AddRuleOrderItemFailed()))
        catchError((err) => of(new ErrorMessage('public.global.errorExpected', '209', [], err)))
      )
    )
  );

  // for future use: bulk add offers to cart
  // @Effect()
  // onAddOrderItems = this.actions$.pipe(
  //   ofType<AddOrderItems>(StoreActionType.AddOrderItems),
  //   switchMap(action => this.storeService.addOrderItems(action.storeId, action.uuid, action.orderItems).pipe(
  //     map(s => new AddOrderItemSuccess(s)),
  //     catchError(a => of(new ErrorMessage('public.global.errorExpected', '203')))
  //   )
  // )
  // );

  @Effect()
  onUpdateOrderItem = this.actions$.pipe(
    ofType<UpdateOrderItem>(StoreActionType.UpdateOrderItem),
    switchMap(action => this.storeService.updateOrderItem(action.storeId, action.cartUuid, action.itemUuid, action.orderItem).pipe(
        tap(_ => {
          if (this.checkoutService.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.PAYMENTSENSE){
            this.store.dispatch(new CreatePaymentsenseToken(action.storeId, action.cartUuid));
          }
          if (this.checkoutService.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.RMS) {
            this.store.dispatch(new CreateRMSRequestJSON(action.storeId, action.cartUuid));
          }
          if (this.checkoutService.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.JCC) {
            this.store.dispatch(new CreateJCCRequestJSON(action.storeId, action.cartUuid));
          }
        }),
        map(s => new UpdateOrderItemSuccess(s)),
        // catchError(a => of(new UpdateOrderItemFailed()))
        catchError((err) => of(new ErrorMessage('public.global.errorExpected', '204', [], err)))
      )
    )
  );

  @Effect()
  onRemoveOrderItem = this.actions$.pipe(
    ofType<RemoveOrderItem>(StoreActionType.RemoveOrderItem),
    switchMap(action => this.storeService.removeOrderItem(action.storeId, action.orderUuid, action.itemUuid).pipe(
      map(s => new RemoveOrderItemSuccess(s)),
      // catchError(a => of(new RemoveOrderItemFailed()))
      catchError((err) => of(new ErrorMessage('public.global.errorExpected', '205', [], err)))
    )),
  );

  @Effect()
  onRemoveRuleOrderItem = this.actions$.pipe(
    ofType<RemoveRuleOrderItem>(StoreActionType.RemoveRuleOrderItem),
    switchMap(action => this.storeService.removeOrderItem(action.storeId, action.uuid, action.itemUuid).pipe(
        map(s => new RemoveRuleOrderItemSuccess(s)),
        catchError((err) => of(new ErrorMessage('public.global.errorExpected', '211', [], err)))
      )
    )
  );

  @Effect()
  onOrderUpdate = this.actions$.pipe(
    ofType<OrderUpdate>(StoreActionType.OrderUpdate),
    switchMap(action => this.storeService.orderUpdate(action.storeId, action.orderUuid, action.payload, false).pipe(
        tap(_ => {
          if (action.orderUpdateType === 'UpdateZipCode' || action.orderUpdateType === 'UpdateZoneLocation') {
            this.store.dispatch(new GetAssociatedZone(action.storeId, action.orderUuid, action.payload.deliveryPostCode));
          }
          if (this.checkoutService.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.PAYMENTSENSE){
            this.store.dispatch(new CreatePaymentsenseToken(action.storeId, action.orderUuid));
          }
          if (this.checkoutService.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.RMS) {
            this.store.dispatch(new CreateRMSRequestJSON(action.storeId, action.orderUuid));
          }
          if (this.checkoutService.getOrderMetaData('paymentMethod') === PAYMENT_METHOD.RMS) {
            this.store.dispatch(new CreateJCCRequestJSON(action.storeId, action.orderUuid));
          }
        }),
        map(s => new OrderUpdateSuccess(s)),
        catchError((err) => {
          if (err.error.errors[0].code !== 'INVALID_CUSTOMER_VOUCHER'){
            return of(new ErrorMessage('public.global.errorExpected', '206', [], err));
          }
        })
    )),
  );

  @Effect()
  onOrderUpdateSuccess = this.actions$.pipe(
    ofType<OrderUpdateSuccess>(StoreActionType.OrderUpdateSuccess),
    withLatestFrom(this.store.select(getCurrentCartUuid), this.store.select(getSelectedStore), this.store.select(getSelectedLang)),
    switchMap(([, orderUuid, selectedStore, lang]) => {
      return [new CheckExistingOrder(selectedStore.id, orderUuid, 'CHECKEXISTING', lang)];
    })
  );

  @Effect()
  onGetAssociatedZone = this.actions$.pipe(
    ofType<GetAssociatedZone>(StoreActionType.GetAssociatedZone),
    switchMap(action => this.storeService.getAssociatedZone(action.storeId, action.orderUuid).pipe(
        map(s => new GetAssociatedZoneSuccess(s, action.orderPostCode)),
        catchError((err) =>
          of(new ErrorMessage('public.global.errorExpected', '206', [], err))
        )
    )),
  );

  @Effect()
  onSubmitOrder = this.actions$.pipe(
    ofType<SubmitOrder>(StoreActionType.SubmitOrder),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, selectedStore]) =>
      this.storeService.orderUpdate(action.storeId, action.orderUuid, action.payload, action.v2Support).pipe(
      map(s => new SubmitOrderSuccess(s)),
        catchError(a => {
          if (a.error && a.error.errors) {
            let consumedError;

            // Handle wish time error
            // Handle slot selection error
            consumedError = a.error.errors.find(e => e.code === 'ORDER_WISH_TIME_INVALID' || e.code === 'ORDER_PER_SLOT_LIMIT_REACHED');
            if (consumedError !== undefined) {
              return of(
                new SubmitOrderFailed(),
                new ToggleUnavailableDeliveryTimeError(
                  true,
                  consumedError.additionalInfo ? consumedError.additionalInfo.after : undefined,
                )
              );
            }

            // Handle offer availability errors
            consumedError = a.error.errors.find(e => e.code === 'OFFER_AVAILABILITY_SCHEDULE_ERROR');
            if (consumedError !== undefined) {

              let offers: UnavailableOffer;
              if (consumedError.additionalInfo) {
                offers = consumedError.additionalInfo;
              }

              return of(new SubmitOrderFailed(), new ToggleOffersUnavailable(true, offers));
            }

            // Handle out of stock errors
            consumedError = a.error.errors.find(e => e.code === 'OUT_OF_STOCK');
            if (consumedError !== undefined) {
              const offers: OutOfStockOffer[] = [];
              if (consumedError.additionalInfo && consumedError.additionalInfo.offers) {
                consumedError.additionalInfo.offers.forEach(t =>
                  offers.push({
                    offerId: t.id,
                    orderItemUuid: t.orderItemUuid,
                    parentOrderItemUuid: t.parentOrderItemUuid,
                    stockQuantity: t.currentStock,
                    orderQuantity: t.currentStock + t.deficit, deficit: t.deficit,
                    offerName: t.offerName,
                    parentOfferName: t.parentOfferName,
                    variantDescription: t.variantDescription
                  })
                );
              }
              return of(new SubmitOrderFailed(), new ToggleOffersOutOfStock(true, offers));
            }

            // Handle same day ordering errors
            const consumedErrors = a.error.errors.filter(e => e.code === 'ORDER_STORE_SAME_DAY_ORDERING_DISABLED'
                                                  || e.code === 'ORDER_STORE_ZONE_SAME_DAY_ORDERING_DISABLED'
                                                  || e.code === 'ORDER_STORE_CATALOG_CATEGORY_OFFER_SAME_DAY_ORDERING_DISABLED');
            if (consumedErrors.length > 0) {
              const sameDayOrderingErrors: SameDayOrderingError[] = consumedErrors.map(err => ({
                code: err.code,
                additionalInfo: err.additionalInfo && err.additionalInfo.offers ? [...err.additionalInfo.offers] : [],
              }));
              return of(new SubmitOrderFailed(), new ToggleSameDayOrderingDisabled(true, sameDayOrderingErrors));
            }

            // Handle order minimum amount not met errors
            consumedError = a.error.errors.find(e => e.code === 'ORDER_MINIMUM_AMOUNT_NOT_MET');
            if (consumedError !== undefined) {
              return of(
                new SubmitOrderFailed(),
                new ErrorMessage('public.checkout.errors.' + consumedError.code, null, null, consumedError.additionalInfo)
              );
            }

            // Handle any other errors
            const errors = [];
            a.error.errors.forEach(e => {
              if (e.code) {
                errors.push({code: e.code});
              }
            });
            const storeDetails = `Store id: ${selectedStore.id}, Store alias: ${selectedStore.aliasName}`;
            this.logger.error('onSubmitOrder errors during submission', storeDetails , errors);
            if (errors.length) {
              return of(new SubmitOrderFailed(), new ToggleOrderSubmitError(true, errors));
            }

          }
          return of(new SubmitOrderFailed(), new ErrorMessage('public.global.errorExpected', '207', [], a));
        }
       )
    )),
  );

  @Effect()
  onUpdateOrderQuantities = this.actions$.pipe(
    ofType<UpdateOrderItemQuantities>(StoreActionType.UpdateOrderItemQuantities),
    withLatestFrom(this.store.select(getCurrentCartUuid), this.store.select(getSelectedStore)),
    switchMap(([action, orderUuid, store]) =>
      this.storeService.orderUpdateQuantities(store.id, orderUuid, action.offers).pipe(
        map( () => new UpdateOrderItemQuantitiesSuccess()),
        catchError(() => of(new UpdateOrderItemQuantitiesFailed()))
      ))
  );

  @Effect()
  onUpdateOrderQuantitiesSuccess = this.actions$.pipe(
    ofType<UpdateOrderItemQuantitiesSuccess>(StoreActionType.UpdateOrderItemQuantitiesSuccess),
    withLatestFrom(
      this.store.select(getCurrentCartUuid),
      this.store.select(getSelectedStore),
      this.store.select(getSelectedLang),
      this.store.select(getCurrentOrderMetaState)
    ),
    switchMap(([, orderUuid, store, lang, orderMetaState]) => [
      new CheckExistingOrder(store.id, orderUuid, 'CHECKEXISTING', lang),
      new LoadCatalog(store.id, lang, orderMetaState.data.wishTime),
      new ToggleOffersUnavailable(false),
      new ToggleOffersOutOfStock(false)
    ])
  );


  @Effect()
  onOrderUpdateStatus = this.actions$.pipe(
    ofType<OrderUpdateStatus>(StoreActionType.OrderUpdateStatus),
    switchMap(action =>
      this.storeService.orderUpdateStatus(action.storeId, action.orderUuid, action.orderStatus).pipe(
        map( res => new OrderUpdateStatusSuccess(res)),
        catchError(a =>
          (a.error && a.error.errors && a.error.errors[0].code === 'OUT_OF_STOCK')
          ? of(new OrderUpdateStatusFailed(), new ErrorMessage('public.checkout.itemsOutOfStock', '210'))
         : of(new OrderUpdateStatusFailed(), new ErrorMessage('public.global.errorExpected', '208', [], a))
       )
      ))
  );

  @Effect()
  onViewOrderStatus = this.actions$.pipe(
    ofType<CheckExistingOrder>(StoreActionType.ViewOrderStatus),
    switchMap(action => this.storeService.checkExistingOrder(action.storeId, action.orderUuid, action.locale).pipe(
      map(s => new ViewOrderStatusSuccess(s)),
      catchError(() => of(new ViewOrderStatusFailed()))
    ))
  );

  @Effect()
  onLoadLocation = this.actions$.pipe(
    ofType<ValidateStoreLocations>(StoreActionType.ValidateStoreLocations),
    switchMap(action => this.storeService.validateStoreLocation(action.storeId, action.storeLocation).pipe(
      map(s => new ValidateStoreLocationsSuccess(s)),
      catchError(() => of(new ValidateStoreLocationsFail()))
    ))
  );

  @Effect()
  onSendOrderByEmail = this.actions$.pipe(
    ofType<SendOrderByEmail>(StoreActionType.SendOrderByEmail),
    switchMap(action => this.storeService.sendOrderByEmail(action.orderUuid, action.email).pipe(
      map(s => new SendOrderByEmailSuccess(s)),
      catchError(() => of(new SendOrderByEmailFail()))
    ))
  );

  // zone
  @Effect()
  onGetZonePerZipcode = this.actions$.pipe(
    ofType<GetZonePerZipcode>(StoreActionType.GetZonePerZipcode),
    switchMap(action => this.storeService.getZonePerZipcode(action.storeId, action.zipCode).pipe(
      switchMap(s => [new GetZonePerZipcodeSuccess(s)]),
      catchError(() => of(new GetZonePerZipcodeFail()))
    ))
  );

  @Effect()
  onUpdateZipCode = this.actions$.pipe(
    ofType<UpdateZipCode>(StoreActionType.UpdateZipCode),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    map(([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang]) => {
      orderMeta.data.customerZip = action.zipCode;
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, clientStore, validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, 'UpdateZipCode');
    })
  );

  // store rules
  @Effect()
  onGetStoreRules = this.actions$.pipe(
    ofType<GetStoreRules>(StoreActionType.GetStoreRules),
    switchMap(action => this.storeService.getStoreRules(action.storeId, action.langId).pipe(
      map(s => new GetStoreRulesSuccess(s)),
      catchError(() => of(new GetStoreRulesFail(), new ErrorMessage('public.global.errorExpected', '603')))
    ))
  );

  @Effect()
  onUpdateDeliveryMethod = this.actions$.pipe(
    ofType<UpdateDeliveryMethod>(StoreActionType.UpdateDeliveryMethod),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang),
      this.store.select(getCurrentCartStatus)),
    filter(
      ([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang, cartStatus]) => cartStatus !== 'LOADING' && orderUuid
    ),
    map(([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang, cartStatus]) => {
      orderMeta.data.deliveryMethod = action.deliveryMethod;
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, clientStore, validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest);
    })
  );

  @Effect()
  onUpdateVoucher = this.actions$.pipe(
    ofType<UpdateVoucher>(StoreActionType.UpdateVoucher),
    map(action => {
      if (!!action.voucherCode) {
        return new ValidateVoucher(action.voucherCode);
      } else {
        return new RemoveVoucher();
      }
    })
  );

  @Effect()
  onRemoveVoucher = this.actions$.pipe(
    ofType<RemoveVoucher>(StoreActionType.RemoveVoucher),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([, clientStore, orderUuid, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, clientStore, validLocations, selectedLang);
      orderUpdateRequest.voucherCode = '';
      return [
        new AddCheckoutState('voucherFormValid', true),
        new AddOrderMeta('voucherCode', orderUpdateRequest.voucherCode)];
    })
  );

  @Effect()
  onValidateVoucher = this.actions$.pipe(
    ofType<ValidateVoucher>(StoreActionType.ValidateVoucher),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang]) =>
      this.storeService.validateVoucher(clientStore.id, action.voucherCode).pipe(
        mergeMap(s => {
          if (s.isActive) {
            const orderUpdateRequest =
              OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, clientStore, validLocations, selectedLang);
            if (!('errorMessage' in  orderUpdateRequest)) {
              orderUpdateRequest.voucherCode = action.voucherCode;
              return [
                new AddCheckoutState('voucherFormValid', true),
                new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest),
                new ValidateVoucherSuccess(s.discount, s.discountType, s.type)];
            }
          }
          return [new ValidateVoucherFailed()];
        }),
        catchError(() => of(new ValidateVoucherFailed()))
      )
    )
  );

  @Effect()
  onValidateVoucherFailed = this.actions$.pipe(
    ofType<ValidateVoucherFailed>(StoreActionType.ValidateVoucherFailed),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([, clientStore, orderUuid, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, clientStore, validLocations, selectedLang);
      orderUpdateRequest.voucherCode = '';
      return [
        new AddCheckoutState('voucherFormValid', false),
        new AddOrderMeta('voucherCode', orderUpdateRequest.voucherCode)];
    })
  );

  @Effect()
  onFetchSlots = this.actions$.pipe(
    ofType<FetchSlots>(StoreActionType.FetchSlots),
    withLatestFrom(this.store.select(getCurrentOrderWishTime), this.store.select(getStoreOpeningInfo)),
    switchMap(([action, currentOrderWishTime, storeOpeningInfo]) => {
      let wishDate = new Date(currentOrderWishTime ? currentOrderWishTime : '');
      if (isNaN(wishDate.valueOf())) {
        wishDate = new Date();
      }
      return this.storeService.getSlots(
          action.storeId,
          action.deliveryMode,
          action.date && storeOpeningInfo.date ? action.date : (currentOrderWishTime ? dayjs(wishDate).format('YYYY-MM-DD') : null)
        ).pipe(
          map(s => new FetchSlotsSuccess(action.deliveryMode, s, action.date)),
          catchError((err) => of(new FetchSlotsFailed(), new ErrorMessage('public.global.errorExpected', '220', [], err)))
        );
    })
  );

  @Effect()
  onFetchSlotsSuccess = this.actions$.pipe(
    ofType<FetchSlotsSuccess>(StoreActionType.FetchSlotsSuccess),
    withLatestFrom(this.store.select(getSelectedStore), this.store.select(getSelectedLang)),
    filter(([action, store, language]) => !!store && !!store.id),
    map(([action, store, language]) => {
      if ((!!action.response.inStoreLocation && !!action.response.inStoreLocation.selectedSlot) ||
      (!!action.response.noLocation && !!action.response.noLocation.selectedSlot) ||
      (!!action.response.address && !!action.response.address.selectedSlot)) {
        switch (action.deliveryMode) {
          case 'IN_STORE_LOCATION':
            return new LoadCatalog(store.id, language, action.response.inStoreLocation.selectedSlot.startTime);
          case 'NO_LOCATION':
            return new LoadCatalog(store.id, language, action.response.noLocation.selectedSlot.startTime);
          case 'ADDRESS':
            return new LoadCatalog(store.id, language, action.response.address.selectedSlot.startTime);
        }
      }
      // If there is no selected slot in the response as no slot is available, the date selected by the user is used to get catalog...
      if (action.requestDate) {
        const requestDate = new Date(action.requestDate);
        return new LoadCatalog(store.id, language, requestDate.toISOString());
      } else {
        return new LoadCatalog(store.id, language);
      }
    })
  );

  @Effect()
  onUpdateOrderWishTime = this.actions$.pipe(
    ofType<UpdateOrderWishTime>(StoreActionType.UpdateOrderWishTime),
    withLatestFrom(this.store.select(getSelectedStore), this.store.select(getCurrentOrderDeliveryMethod)),
    switchMap(([action, store, deliveryMethod]) =>
      this.storeService.getSlots(
        store.id,
        DELIVERY_METHODS[deliveryMethod],
        dayjs(action.suggestedSlot.startTime).format('YYYY-MM-DD')
      ).pipe(
        map(res => new UpdateOrderWishTimeSuccess(action.suggestedSlot, DELIVERY_METHODS[deliveryMethod], res)),
        catchError(() => of(new UpdateOrderWishTimeFailed()))
      ))
  );

  @Effect()
  onUpdateOrderWishTimeSuccess = this.actions$.pipe(
    ofType<UpdateOrderWishTimeSuccess>(StoreActionType.UpdateOrderWishTimeSuccess),
    map(a => new ToggleUnavailableDeliveryTimeError(false))
  );

  @Effect()
  onGeocodeAddress = this.actions$.pipe(
    ofType<GeocodeAddress>(StoreActionType.GeocodeAddress),
    switchMap((action) =>
      this.storeService.getLocationFromAddress(
        action.address,
        action.zipCode,
        action.countryCode
      ).pipe(
        map(res =>
          res.results.length
            ? new GeocodeAddressSuccess(res.results[0].geometry.location.lat, res.results[0].geometry.location.lng)
            : new GeocodeAddressFailed()
        ),
        catchError(() => of(new GeocodeAddressFailed())),
      )
    )
  );

  @Effect()
  onGeocodeAddressSuccess = this.actions$.pipe(
    ofType<GeocodeAddressSuccess>(StoreActionType.GeocodeAddressSuccess),
    withLatestFrom(
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    filter(([action, orderMetaData]) =>
      action.latitude !== orderMetaData.data.latitude || action.longitude !== orderMetaData.data.longitude
    ),
    map(([action, orderMeta, clientStore, orderUuid, validLocations, selectedLang]) => {
      console.log(action.latitude, action.longitude);
      orderMeta.data.latitude = action.latitude;
      orderMeta.data.longitude = action.longitude;
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, clientStore, validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, 'UpdateZoneLocation');
    })
  );

  @Effect()
  onGeocodeAddressFailed = this.actions$.pipe(
    ofType<GeocodeAddressFailed>(StoreActionType.GeocodeAddressFailed),
    withLatestFrom(
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    filter(([, orderMetaData]) => !!orderMetaData.data.latitude || !!orderMetaData.data.longitude),
    map(([, orderMeta, clientStore, orderUuid, validLocations, selectedLang]) => {
      delete orderMeta.data.latitude;
      // orderMeta.data.latitude = undefined;
      delete orderMeta.data.longitude;
      // orderMeta.data.longitude = undefined;
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, clientStore, validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest);
    })
  );
}
