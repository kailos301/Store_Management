import { CartStatusUpdate } from './../../store/+state/stores.actions';
import { SquareService } from './../square.service';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import {
  PaymentActionType,
  ObtainToken,
  ObtainTokenFailed,
  ObtainTokenSuccess,
  CreatePaypalOrder,
  CreatePaypalOrderSuccess,
  CreatePaypalOrderFailed,
  CreateStripePaymentIntentSuccess,
  CreateStripePaymentIntentFailed,
  CreateIdealPaymentIntentSuccess,
  CreateIdealPaymentIntentFailed,
  CreateBancontactPaymentIntentFailed,
  CreateBancontactPaymentIntentSuccess,
  CheckoutSquare,
  CreateVivaPaymentToken,
  CreateVivaPaymentTokenSuccess,
  CreateVivaPaymentTokenFailed,
  ChargeVivaPayment,
  ChargeVivaPaymentSuccess,
  ChargeVivaPaymentFailed,
  CreateStripeDigitalWalletPaymentIntentSuccess,
  CreateStripeDigitalWalletPaymentIntentFailed,
  CreatePaymentsenseToken,
  CreatePaymentsenseTokenSuccess,
  CreatePaymentsenseTokenFailed,
  CompletePaymentsensePayment,
  CompletePaymentsensePaymentSuccess,
  CompletePaymentsensePaymentFailed,
  CreateRMSRequestJSON,
  CreateRMSRequestJSONSuccess,
  CreateRMSRequestJSONFailed,
  CompleteRMSPayment,
  CompleteRMSPaymentSuccess,
  CompleteRMSPaymentFailed,
  CreateTrustPaymentsRequestJSON,
  CreateTrustPaymentsRequestJSONSuccess,
  CreateTrustPaymentsRequestJSONFailed,
  CompleteTrustPaymentsPayment,
  CompleteTrustPaymentsPaymentSuccess,
  CompleteTrustPaymentsPaymentFailed,
  CompleteStripePayment,
  CreateJCCRequestJSON,
  CreateJCCRequestJSONSuccess,
  CreateJCCRequestJSONFailed,
  CompleteJCCPayment,
  CompleteJCCPaymentSuccess,
  CompleteJCCPaymentFailed,
  ClearTrustPaymentsPayment,
} from './payment.actions';
import { PaypalService } from '../paypal.service';
import { of } from 'rxjs';
import { StripeService } from '../stripe.service';
import { ErrorMessage } from '../../store/+state/stores.actions';
import { VivaService } from '../viva.service';
import { select, Store } from '@ngrx/store';
import { getVivaStore } from './payment.selectors';
import { PaymentsenseService } from '../paymentsense.service';
import { getCurrentOrderMetaState, getSelectedLang, getSelectedStore, getStoreLocationsState } from '../../store/+state/stores.selectors';

import OrderUtils from '../../store/utils/OrderUtils';
import { OrderUpdateRequest } from '../../store/types/OrderUpdateRequest';
import { RMSService } from '../rms.service';
import { TrustPaymentsService } from '../trustPayments.service';
import { StoreService } from '../../store/store.service';
import { PaymentMethod } from '../../store/types/PaymentMethod';
import { JCCService } from '../jcc.service';
import { Router } from '@angular/router';
@Injectable()
export class PaymentStoresEffects {

  constructor(
    private actions$: Actions,
    private paypalService: PaypalService,
    private stripeService: StripeService,
    private squareService: SquareService,
    private vivaService: VivaService,
    private paymentSenseService: PaymentsenseService,
    private rmsService: RMSService,
    private trustPaymentsService: TrustPaymentsService,
    private store: Store <any>,
    private storeService: StoreService,
    private jccService: JCCService,
    private router: Router,
  ) {}

  @Effect()
  onObtainToken = this.actions$.pipe(
    ofType<ObtainToken>(PaymentActionType.ObtainToken),
    switchMap(action => this.paypalService.obtainAccessToken().pipe(
      map(s => new ObtainTokenSuccess(s)),
      catchError(a => of(new ObtainTokenFailed()))
    ))
  );

  @Effect()
  onCreatePaypalOrder = this.actions$.pipe(
    ofType<CreatePaypalOrder>(PaymentActionType.CreatePaypalOrder),
    switchMap(action => this.paypalService.createPaypalOrder(action.paypalConfigObject, action.accessToken).pipe(
      map(s => new CreatePaypalOrderSuccess(s)),
      catchError(a => of(new CreatePaypalOrderFailed()))
    ))
  );

  // STRIPE

  @Effect()
  onCreateStripePaymentIntent = this.actions$.pipe(
    ofType<any>(PaymentActionType.CreateStripePaymentIntent),
    switchMap(action =>
      this.stripeService.initiateStripePaymentIntent(
        action.storeId,
        action.orderUuid,
        PaymentMethod.CREDIT_CARD_STRIPE)
      .pipe(
        map(s => new CreateStripePaymentIntentSuccess(s)),
        catchError(a => of(new CreateStripePaymentIntentFailed()))
    ))
  );

  @Effect()
  onCompleteStripePayment = this.actions$.pipe(
    ofType <CompleteStripePayment>(PaymentActionType.CompleteStripePayment),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, selectedStore, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest: OrderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
        orderMeta.data,
        selectedStore,
        validLocations,
        selectedLang,
      );
      orderUpdateRequest.paymentInfo = {
        paymentIntentId: action.paymentIntentId
      };
      orderUpdateRequest.status = 'SUBMITTED';
      return this.paymentSenseService
        .completePayment(action.storeId, action.orderUuid, orderUpdateRequest)
        .pipe(
          map(r => new CartStatusUpdate('FINISHED_ONLINE_PAYMENT')),
          catchError(e => {
            if (e.error instanceof ErrorEvent) {
              return of(new ErrorMessage(e.error.message));
            } else {
              return of(new ErrorMessage(e.error.errors[0].message));
            }
          })
        );
    })
  );

  // iDeal

  @Effect()
  onCreateIdealPaymentIntent = this.actions$.pipe(
    ofType<any>(PaymentActionType.CreateIdealPaymentIntent),
    switchMap(action =>
      this.stripeService.initiateStripePaymentIntent(
        action.storeId, action.orderUuid, PaymentMethod.IDEAL)
      .pipe(
        map(s => new CreateIdealPaymentIntentSuccess(s)),
        catchError(a => of(new CreateIdealPaymentIntentFailed()))
    ))
  );

  // Bancontact

  @Effect()
  onCreateBancontactPaymentIntent = this.actions$.pipe(
    ofType<any>(PaymentActionType.CreateBancontactPaymentIntent),
    switchMap(action =>
      this.stripeService.initiateStripePaymentIntent(
        action.storeId,
        action.orderUuid,
        PaymentMethod.BANCONTACT)
      .pipe(
        map(s => new CreateBancontactPaymentIntentSuccess(s)),
        catchError(a => of(new CreateBancontactPaymentIntentFailed()))
    ))
  );

  // Stripe Digital Wallet

  @Effect()
  onCreateStripeDigitalWalletPaymentIntent = this.actions$.pipe(
    ofType<any>(PaymentActionType.CreateStripeDigitalWalletPaymentIntent),
    switchMap(action =>
      this.stripeService.initiateStripePaymentIntent(
        action.storeId,
        action.orderUuid,
        PaymentMethod.DIGITAL_WALLET_STRIPE)
      .pipe(
        map(s => new CreateStripeDigitalWalletPaymentIntentSuccess(s)),
        catchError(a => of(new CreateStripeDigitalWalletPaymentIntentFailed()))
    ))
  );

  // Square

  @Effect()
  onCheckoutSquare = this.actions$.pipe(
    ofType<CheckoutSquare>(PaymentActionType.CheckoutSquare),
    switchMap(action => this.squareService.doPayment(action.storeId, action.orderUuid, action.nonce, action.verificationToken).pipe(
      map(_ => new CartStatusUpdate('FINISHED_ONLINE_PAYMENT')),
      catchError(e => {
        if (e.error instanceof ErrorEvent) {
          return of(new ErrorMessage(e.error.message));
        } else {
          return of(new ErrorMessage(e.error.errors[0].message));
        }
      })
    ))
  );

  // Viva
  @Effect()
  onCreateVivaPaymentToken = this.actions$.pipe(
    ofType<CreateVivaPaymentToken>(PaymentActionType.CreateVivaPaymentToken),
    switchMap(action => this.vivaService.createToken(action.storeId, action.orderUuid).pipe(
      map(r => new CreateVivaPaymentTokenSuccess(r)),
      catchError(e => of(new CreateVivaPaymentTokenFailed()))
    ))
  );

  @Effect()
  onChargeVivaPayment = this.actions$.pipe(
    ofType<ChargeVivaPayment>(PaymentActionType.ChargeVivaPayment),
    withLatestFrom(this.store.pipe(select(getVivaStore), map(s => s.vivaState.vivaToken.accessToken))),
    switchMap(([action, accessToken]) => this.vivaService.doPayment(action.storeId, action.orderUuid, action.chargeToken, accessToken).pipe(
      map(r => new ChargeVivaPaymentSuccess()),
      catchError(e => of(new ChargeVivaPaymentFailed()))
    ))
  );

  // Paymentsense

  @Effect()
  onCreatePaymentsenseToken = this.actions$.pipe(
    ofType<CreatePaymentsenseToken>(PaymentActionType.CreatePaymentsenseToken),
    switchMap(action => this.paymentSenseService.createToken(action.storeId, action.orderUuid).pipe(
      map(r => new CreatePaymentsenseTokenSuccess(r)),
      catchError(e => of(new CreatePaymentsenseTokenFailed()))
    ))
  );

  @Effect()
  onCompletePaymentsensePayment = this.actions$.pipe(
    ofType <CompletePaymentsensePayment>(PaymentActionType.CompletePaymentsensePayment),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, selectedStore, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest: OrderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
        orderMeta.data,
        selectedStore,
        validLocations,
        selectedLang,
      );
      orderUpdateRequest.paymentInfo = {
        accessToken: action.chargeToken
      };
      orderUpdateRequest.status = 'SUBMITTED';
      return this.paymentSenseService
        .completePayment(action.storeId, action.orderUuid, orderUpdateRequest)
        .pipe(
          map(r => new CompletePaymentsensePaymentSuccess()),
          catchError(e => of (new CompletePaymentsensePaymentFailed()))
        );
    })
  );

  // RMS

  @Effect()
  onCreateRMSRequestJSON = this.actions$.pipe(
    ofType<CreateRMSRequestJSON>(PaymentActionType.CreateRMSRequestJSON),
    switchMap(action => this.rmsService.initPayment(action.storeId, action.orderUuid).pipe(
      map(r => new CreateRMSRequestJSONSuccess(r)),
      catchError(e => of(new CreateRMSRequestJSONFailed()))
    ))
  );

  @Effect()
  onCompleteRMSPayment = this.actions$.pipe(
    ofType<CompleteRMSPayment>(PaymentActionType.CompleteRMSPayment),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, selectedStore, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest: OrderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
        orderMeta.data,
        selectedStore,
        validLocations,
        selectedLang,
      );
      orderUpdateRequest.paymentInfo = action.paymentInfo;
      orderUpdateRequest.status = 'SUBMITTED';
      return this.rmsService
        .completePayment(action.storeId, action.orderUuid, orderUpdateRequest)
        .pipe(
          map(r => new CompleteRMSPaymentSuccess()),
          catchError(e => of (new CompleteRMSPaymentFailed()))
        );
    })
  );

  // TrustPayments

  @Effect()
  onCreateTrustPaymentsRequestJSON = this.actions$.pipe(
    ofType<CreateTrustPaymentsRequestJSON>(PaymentActionType.CreateTrustPaymentsRequestJSON),
    switchMap(action => this.trustPaymentsService.initPayment(action.storeId, action.orderUuid).pipe(
      map(r => new CreateTrustPaymentsRequestJSONSuccess(r)),
      catchError(e => of(new CreateTrustPaymentsRequestJSONFailed()))
    ))
  );

  @Effect()
  onCompleteTrustPaymentsPayment = this.actions$.pipe(
    ofType<CompleteTrustPaymentsPayment>(PaymentActionType.CompleteTrustPaymentsPayment),
    switchMap((action) => {
      return this.trustPaymentsService
        .verifyPayment(action.storeId, action.orderUuid, action.paymentInfo)
        .pipe(
          map(r => new CartStatusUpdate('FINISHED_ONLINE_PAYMENT')),
          catchError(e => {
            this.router.navigateByUrl(`#cart`);
            return of(new CompleteTrustPaymentsPaymentFailed());
          })
        );
    })
  );


  @Effect()
  onCreateJCCRequestJSON = this.actions$.pipe(
    ofType<CreateJCCRequestJSON>(PaymentActionType.CreateJCCRequestJSON),
    switchMap(action => this.jccService.initPayment(action.storeId, action.orderUuid).pipe(
      map(r => new CreateJCCRequestJSONSuccess(r)),
      catchError(e => of(new CreateJCCRequestJSONFailed()))
    ))
  );

  @Effect()
  onCompleteJCCPayment = this.actions$.pipe(
    ofType<CompleteJCCPayment>(PaymentActionType.CompleteJCCPayment),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, selectedStore, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest: OrderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
        orderMeta.data,
        selectedStore,
        validLocations,
        selectedLang,
      );
      orderUpdateRequest.paymentInfo = action.paymentInfo;
      orderUpdateRequest.status = 'SUBMITTED';
      return this.jccService
        .completePayment(action.storeId, action.orderUuid, orderUpdateRequest)
        .pipe(
          map(r => new CompleteJCCPaymentSuccess()),
          catchError(e => of (new CompleteJCCPaymentFailed()))
        );
    })
  );
}
