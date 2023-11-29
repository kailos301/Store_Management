import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import {
  StorePaymentMethodsActionType,
  ConnectStripe,
  ToggleStripe,
  ToggleStripeSuccess,
  ToggleStripeFailed,
  DisconnectStripe,
  DisconnectStripeSuccess,
  DisconnectStripeFailed,
  ConnectPaypal,
  TogglePaypal,
  TogglePaypalSuccess,
  TogglePaypalFailed,
  DisconnectPaypal,
  DisconnectPaypalSuccess,
  DisconnectPaypalFailed,
  ToggleSquareSuccess,
  ToggleSquareFailed,
  ToggleSquare,
  ConnectPaymentsense,
  ConnectPaymentsenseSuccess,
  ConnectPaymentsenseFailed,
  ConnectJCC,
  ConnectJCCSuccess,
  ConnectJCCFailed,
  DisConnectJCC,
  DisConnectJCCSuccess,
  DisConnectJCCFailed,
  ConnectTrustPayments,
  ConnectTrustPaymentsSuccess,
  ConnectTrustPaymentsFailed,
  DisconnectTrustPaymentsFailed,
  DisconnectTrustPaymentsSuccess,
  DisconnectTrustPayments,
} from './payment.actions';
import { StorePaymentMethodsService } from '../store-payment-methods.service';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { getSelectedStore } from '../../+state/stores.selectors';
import { ToastrService } from 'ngx-toastr';
import { StoresService } from '../../stores.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class StorePaymentEffects {

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private storePaymentMethodsService: StorePaymentMethodsService,
    private storesService: StoresService,
    private toastr: ToastrService,
    private translateSer: TranslateService) { }


  @Effect({ dispatch: false })
  onConnectStripe = this.actions$.pipe(
    ofType<ConnectStripe>(StorePaymentMethodsActionType.ConnectStripe),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storePaymentMethodsService.connectStripe(store.id).pipe(
      tap(s => window.location.href = s)
    ))
  );

  @Effect()
  onToggleStripe = this.actions$.pipe(
    ofType<ToggleStripe>(StorePaymentMethodsActionType.ToggleStripe),
    withLatestFrom(this.store.select(getSelectedStore)),
    map(([a, s]) => ({settings: [{key: a.key, value: a.enabled}], id: s.id, enabled: a.enabled, key: a.key})),
    switchMap( r => this.storesService.updateSettings(r.id, r.settings)
      .pipe(
        map(store => new ToggleStripeSuccess(store.settings)),
        catchError(e => {
          return of(new ToggleStripeFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onToggleStripeSuccess = this.actions$.pipe(
    ofType<ToggleStripeSuccess>(StorePaymentMethodsActionType.ToggleStripeSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onToggleStripeFailed = this.actions$.pipe(
    ofType<ToggleStripeFailed>(StorePaymentMethodsActionType.ToggleStripeFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  );

  @Effect()
  onDisconnectStripe = this.actions$.pipe(
    ofType<DisconnectStripe>(StorePaymentMethodsActionType.DisconnectStripe),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storePaymentMethodsService.disconnectStripe(store.id).pipe(
      map(s => new DisconnectStripeSuccess()),
      catchError(e => of(new DisconnectStripeFailed(e.error.errors.map((err: { message: any; }) => err.message))))
    ))
  );

  @Effect({ dispatch: false })
  onDisconnectStripeSuccess = this.actions$.pipe(
    ofType<DisconnectStripeSuccess>(StorePaymentMethodsActionType.DisconnectStripeSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.stripeDisconnect'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onDisconnectStripeFailed = this.actions$.pipe(
    ofType<DisconnectStripeFailed>(StorePaymentMethodsActionType.DisconnectStripeFailed),
    tap(a => a.errorMessages.forEach( e =>
      this.toastr.error(e, 'Failed!')
    ))
  );

  @Effect({ dispatch: false })
  onConnectPaypal = this.actions$.pipe(
    ofType<ConnectPaypal>(StorePaymentMethodsActionType.ConnectPaypal),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storePaymentMethodsService.connectPaypal(store.id).pipe(
      tap(s => window.location.href = s)
    ))
  );

  @Effect()
  onTogglePaypal = this.actions$.pipe(
    ofType<TogglePaypal>(StorePaymentMethodsActionType.TogglePaypal),
    withLatestFrom(this.store.select(getSelectedStore)),
    map(([a, s]) => ({settings: [{key: 'PAYMENT_PAYPAL_ENABLED', value: a.enabled}], id: s.id, enabled: a.enabled})),
    switchMap( r => this.storesService.updateSettings(r.id, r.settings)
      .pipe(
        map(store => new TogglePaypalSuccess(store.settings)),
        catchError(e => {
          return of(new TogglePaypalFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onTogglePaypalSuccess = this.actions$.pipe(
    ofType<TogglePaypalSuccess>(StorePaymentMethodsActionType.TogglePaypalSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onTogglePaypalFailed = this.actions$.pipe(
    ofType<TogglePaypalFailed>(StorePaymentMethodsActionType.TogglePaypalFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  );

  @Effect()
  onDisconnectPaypal = this.actions$.pipe(
    ofType<DisconnectPaypal>(StorePaymentMethodsActionType.DisconnectPaypal),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storePaymentMethodsService.disconnecPaypal(store.id).pipe(
      map(s => new DisconnectPaypalSuccess()),
      catchError(e => of(new DisconnectPaypalFailed(e.error.errors.map((err: { message: any; }) => err.message))))
    ))
  );

  @Effect({ dispatch: false })
  onDisconnectPaypalSuccess = this.actions$.pipe(
    ofType<DisconnectPaypalSuccess>(StorePaymentMethodsActionType.DisconnectPaypalSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.paypalDisconnect'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onDisconnectPaypalFailed = this.actions$.pipe(
    ofType<DisconnectPaypalFailed>(StorePaymentMethodsActionType.DisconnectPaypalFailed),
    tap(a => a.errorMessages.forEach( e =>
      this.toastr.error(e, 'Failed!')
    ))
  );

  @Effect()
  onToggleSquare = this.actions$.pipe(
    ofType<ToggleSquare>(StorePaymentMethodsActionType.ToggleSquare),
    withLatestFrom(this.store.select(getSelectedStore)),
    map(([a, s]) => ({settings: [{key: 'PAYMENT_SQUARE_CREDIT_CARD_ENABLED', value: a.enabled}], id: s.id, enabled: a.enabled})),
    switchMap( r => this.storesService.updateSettings(r.id, r.settings)
      .pipe(
        map(store => new ToggleSquareSuccess(store.settings)),
        catchError(e => {
          return of(new ToggleSquareFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onToggleSquareSuccess = this.actions$.pipe(
    ofType<ToggleSquareSuccess>(StorePaymentMethodsActionType.ToggleSquareSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onToggleSquareFailed = this.actions$.pipe(
    ofType<ToggleSquareFailed>(StorePaymentMethodsActionType.ToggleSquareFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  );

  @Effect()
  onConnectPaymentsense = this.actions$.pipe(
    ofType<ConnectPaymentsense>(StorePaymentMethodsActionType.ConnectPaymentsense),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectPaymentsense(selectedStore.id, action.settings)
      .pipe(
        map(store => new ConnectPaymentsenseSuccess(store.settings)),
        catchError(e => {
          return of(new ConnectPaymentsenseFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onConnectPaymentsenseSuccess = this.actions$.pipe(
    ofType<ConnectPaymentsenseSuccess>(StorePaymentMethodsActionType.ConnectPaymentsenseSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onConnectPaymentsenseFailed = this.actions$.pipe(
    ofType<ConnectPaymentsenseFailed>(StorePaymentMethodsActionType.ConnectPaymentsenseFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  );

  @Effect()
  onConnectJCC = this.actions$.pipe(
    ofType<ConnectJCC>(StorePaymentMethodsActionType.ConnectJCC),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectJcc(selectedStore.id, action.settings)
      .pipe(
        map(store => new ConnectJCCSuccess(store.settings)),
        catchError(e => {
          return of(new ConnectJCCFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onConnectJCCSuccess = this.actions$.pipe(
    ofType<ConnectJCCSuccess>(StorePaymentMethodsActionType.ConnectJCCSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onConnectJCCFailed = this.actions$.pipe(
    ofType<ConnectJCCFailed>(StorePaymentMethodsActionType.ConnectJCCFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  );

  @Effect()
  onDisConnectJCC = this.actions$.pipe(
    ofType<DisConnectJCC>(StorePaymentMethodsActionType.DisConnectJCC),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectJcc(selectedStore.id)
      .pipe(
        map(store => new DisConnectJCCSuccess()),
        catchError(e => {
          return of(new DisConnectJCCFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onDisConnectJCCSuccess = this.actions$.pipe(
    ofType<DisConnectJCCSuccess>(StorePaymentMethodsActionType.DisConnectJCCSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onDisConnectJCCFailed = this.actions$.pipe(
    ofType<DisConnectJCCFailed>(StorePaymentMethodsActionType.DisConnectJCCFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  );

  @Effect()
  onConnectTrustPayments = this.actions$.pipe(
    ofType<ConnectTrustPayments>(StorePaymentMethodsActionType.ConnectTrustPayments),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectTrustPayments(selectedStore.id, action.settings)
      .pipe(
        map(store => new ConnectJCCSuccess(store.settings)),
        catchError(e => {
          return of(new ConnectJCCFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onConnectTrustPaymentsSuccess = this.actions$.pipe(
    ofType<ConnectTrustPaymentsSuccess>(StorePaymentMethodsActionType.ConnectTrustPaymentsSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onConnectTrustPaymentsFailed = this.actions$.pipe(
    ofType<ConnectTrustPaymentsFailed>(StorePaymentMethodsActionType.ConnectTrustPaymentsFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  );

  @Effect()
  onDisconnectTrustPayments = this.actions$.pipe(
    ofType<DisconnectTrustPayments>(StorePaymentMethodsActionType.DisconnectTrustPayments),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectTrustPayments(selectedStore.id)
      .pipe(
        map(store => new DisconnectTrustPaymentsSuccess()),
        catchError(e => {
          return of(new DisconnectTrustPaymentsFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onDisconnectTrustPaymentsSuccess = this.actions$.pipe(
    ofType<DisconnectTrustPaymentsSuccess>(StorePaymentMethodsActionType.DisconnectTrustPaymentsSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onDisconnectTrustPaymentsFailed = this.actions$.pipe(
    ofType<DisconnectTrustPaymentsFailed>(StorePaymentMethodsActionType.DisconnectTrustPaymentsFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  );
}
