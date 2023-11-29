// tslint:disable: member-ordering
import { STORES_LOCAL_STORAGE_KEY } from './../stores.tokens';
import { getSelectedStore, getUsersList } from './stores.selectors';
import { Router } from '@angular/router';
import { switchMap, map, catchError, tap, withLatestFrom, filter } from 'rxjs/operators';
import { Injectable, Inject, ApplicationRef } from '@angular/core';
import { Effect, Actions, ofType, OnInitEffects } from '@ngrx/effects';
import { StoresService } from '../stores.service';
import {
  StoresActionType,
  LoadStores,
  LoadStoresSuccess,
  LoadStoresFailed,
  LoadStoresPage,
  LoadStore,
  LoadStoreSuccess,
  LoadStoreFailed,
  CreateStore,
  CreateStoreSuccess,
  CreateStoreFailed,
  PartialUpdateStore,
  PartialUpdateStoreSuccess,
  PartialUpdateStoreFailed,
  DeleteStore,
  DeleteStoreSuccess,
  DeleteStoreFailed,
  UpdateStore,
  UpdateStoreSuccess,
  UpdateStoreFailed,
  UpdateStoreVatPercentage,
  UpdateStoreVatPercentageSuccess,
  UpdateStoreVatPercentageFailed,
  DownloadQRFullPdf,
  DownloadQRFullPdfSuccess,
  DownloadQRFullPdfFailed,
  DownloadQRImages,
  DownloadQRImagesSuccess,
  DownloadQRImagesFailed,
  DownloadQRImage,
  DownloadQRImageSuccess,
  DownloadQRImageFailed,
  DownloadQRPdf,
  DownloadQRPdfSuccess,
  DownloadQRPdfFailed,
  UpdateStoreSettings,
  UpdateStoreSettingsSuccess,
  UpdateStoreSettingsFailed,
  LoadUsers,
  LoadUsersSuccess,
  LoadUsersFailed,
  LoadUsersPage,
  InviteUser,
  InviteUserSuccess,
  InviteUserFailed,
  UploadStoreImage,
  UploadStoreImageFailed,
  UploadStoreImageSuccess,
  UploadStoreLogo,
  UploadStoreLogoSuccess,
  UploadStoreLogoFailed,
  SearchStores,
  SearchStoresSuccess,
  SearchStoresFailed,
  LoadStoreStatistics,
  LoadStoreStatisticsSuccess,
  LoadStoreStatisticsFailed,
  StoresAction,
  InitializeState,
  ValidateAliasAvailability,
  ValidateAliasAvailabilitySuccess,
  ValidateAliasAvailabilityFailed,
  RemoveUserStoreAccess,
  RemoveUserStoreAccessSuccess,
  RemoveUserStoreAccessFailed,
  LoadNotificationSubscriptionStatus,
  LoadNotificationSubscriptionStatusSuccess,
  LoadNotificationSubscriptionStatusFailed,
  RequestNotificationPermission,
  ToggleNotificationSubscriptionStatus,
  ToggleNotificationPermitted,
  ToggleNotificationSubscriptionStatusSuccess,
  CreateOrUpdateZoneSuccess,
  GetStatusOfZone,
  GetStatusOfZoneSuccess,
  GetStatusOfZoneFailed,
  LoadZonesSuccess,
  LoadZonesFailed,
  LoadZones,
  LoadZone,
  LoadZoneFailed,
  LoadZoneSuccess,
  CreateOrUpdateZone,
  CreateOrUpdateZoneFailed,
  RemoveZone,
  RemoveZoneSuccess,
  RemoveZoneFailed,
  RemoveStoreImage,
  RemoveStoreImageSuccess,
  RemoveStoreImageFailed,
  RemoveStoreLogoSuccess,
  RemoveStoreLogoFailed,
  RemoveStoreLogo,
  StartOrderNotificationSound,
  CheckStoreHasNewOrder,
  CheckStoreHasNewOrderSuccess,
  CheckStoreHasNewOrderFailed,
  DownloadOrderItemsXls,
  DownloadOrderItemsXlsSuccess,
  DownloadOrderItemsXlsFailed,
  UpdateStoreZoneSettings,
  UpdateStoreZoneSettingsSuccess,
  UpdateStoreZoneSettingsFailed,
  MynextLoginSuccess,
  MynextLoginFailed,
  MynextLogin,
  LoadCustomersSuccess,
  LoadCustomersFailed,
  LoadCustomersPage,
  DownloadCustomersList,
  DownloadCustomersListSuccess,
  DownloadCustomersListFailed,
  LoadOrderItemsStatisticsSuccess,
  LoadOrderItemsStatisticsFailed,
  LoadOrderItemsStatisticsPage,
  HubriseLogin,
  HubriseLoginSuccess,
  HubriseLoginFailed,
  HubriseLogout,
  HubriseLogoutSuccess,
  HubriseLogoutFailed,
  DownloadFlyerFile,
  DownloadFlyerFileSuccess,
  DownloadFlyerFileFailed,
  PowersoftLoginSuccess,
  PowersoftLoginFailed,
  PowersoftLogin,
  DisconnectPowersoftSuccess,
  DisconnectPowersoftFailed,
  DisconnectPowersoft
} from './stores.actions';
import { of, timer } from 'rxjs';
import { Paging } from 'src/app/api/types/Pageable';
import { ToastrService } from 'ngx-toastr';
import { StoresState, SelectedStoreState, AliasAvailabilityStatus } from './stores.reducer';
import { Store, select } from '@ngrx/store';
import { StoreStatistics, StoreZoneStatus, StoreZone } from '../stores';
import { LocalStorageService } from 'src/app/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { PushNotificationService } from 'src/app/shared/push-notification.service';

import { StoreOrderService } from '../store-order/store-order.service';

@Injectable()
export class StoresEffects implements OnInitEffects {

  ngrxOnInitEffects(): StoresAction {
    const storeFromLocalStorage = this.storageService.getSavedState(this.localStorageKey);
    const selectedStore = storeFromLocalStorage ? storeFromLocalStorage.selectedStore as SelectedStoreState : null;
    return selectedStore && selectedStore.store.id > 0 ? new LoadStore(selectedStore.store.id) : new InitializeState();
  }

  constructor(
    private actions$: Actions,
    private store: Store<StoresState>,
    private storesService: StoresService,
    private toastr: ToastrService,
    private storageService: LocalStorageService,
    @Inject(STORES_LOCAL_STORAGE_KEY) private localStorageKey,
    private router: Router,
    private translateSer: TranslateService,
    private pushNotificationService: PushNotificationService,
    private orderService: StoreOrderService,
    private appRef: ApplicationRef) { }

  // Notification Sound effects start
  @Effect()
  onLoadStoreSuccess = this.actions$.pipe(
    ofType<LoadStoreSuccess>(StoresActionType.LoadStoreSuccess),
    map(s => new CheckStoreHasNewOrder())
  );

  @Effect()
  onCheckStoreHasNewOrder = this.actions$.pipe(
    ofType<CheckStoreHasNewOrder>(StoresActionType.CheckStoreHasNewOrder),
    switchMap((action) =>
      timer(0, 10000).pipe(
        withLatestFrom(this.store.pipe(select(getSelectedStore))),
        filter(([t, store]) => !!store.settings.ORDER_NOTIFICATION_SOUND),
        switchMap(([t, store]) => this.orderService.list(store.id, ['SUBMITTED', 'RECEIVED'], { page: 0, size: 1 })),
        map((res) => new CheckStoreHasNewOrderSuccess(res)),
        catchError(e => {
          return of(new CheckStoreHasNewOrderFailed());
        })
      )
    ),
  );

  @Effect()
  onCheckStoreHasNewOrderSuccess = this.actions$.pipe(
    ofType<CheckStoreHasNewOrderSuccess>(StoresActionType.CheckStoreHasNewOrderSuccess),
    map(action => {
      if (action.orders.data.length && action.orders.data[0].status === 'SUBMITTED') {
        return new StartOrderNotificationSound('https://www.gonnaorder.com/wp-content/uploads/2020/09/GonnaOrder-Notification-Bell.wav');
      }
    }),
    filter(a => !!a)
  );


  @Effect()
  onCheckStoreHasNewOrderFailed = this.actions$.pipe(
    ofType<CheckStoreHasNewOrderFailed>(StoresActionType.CheckStoreHasNewOrderFailed),
    switchMap(s =>
      timer(10000).pipe(
        map(t => new CheckStoreHasNewOrder()))
    )
  );
  // Notification Sound effects end

  @Effect()
  onLoadStores = this.actions$.pipe(
    ofType<LoadStores>(StoresActionType.LoadStores),
    switchMap(action => this.list(action.paging, action.aliasName))
  );

  @Effect()
  onLoadStore = this.actions$.pipe(
    ofType<LoadStore>(StoresActionType.LoadStore),
    switchMap(action => this.storesService.load(action.id).pipe(
      map(s => new LoadStoreSuccess(s)),
      catchError(() => of(new LoadStoreFailed()))
    ))
  );

  @Effect()
  onCreateStore = this.actions$.pipe(
    ofType<CreateStore>(StoresActionType.CreateStore),
    switchMap(action => this.storesService.create(action.clientStore)
      .pipe(
        map(s => new CreateStoreSuccess(s.id)),
        catchError(e => {
          if (e.status === 400) {
            return of(new CreateStoreFailed(e.error.errors.map(err => err.message)));
          }
          return of(new CreateStoreFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  );

  @Effect()
  onUpdateStore = this.actions$.pipe(
    ofType<UpdateStore>(StoresActionType.UpdateStore),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.update(id, action.clientStore)
      .pipe(
        map(s => new UpdateStoreSuccess(s)),
        catchError(e => {
          if (e.status === 400) {
            return of(new UpdateStoreFailed(e.error.errors.map(err => err.message)));
          }
          return of(new UpdateStoreFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  );



  @Effect({ dispatch: false })
  onUpdateStoreSuccess = this.actions$.pipe(
    ofType<UpdateStoreSuccess>(StoresActionType.UpdateStoreSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.storeUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a =>
      window.location.href.includes('billing')
        ? this.router.navigate(['/manager/stores/' + a.store.id + '/billing/billing-details'])
        : this.router.navigate(['/manager/stores', a.store.id, 'settings', 'store-edit'])
    )
  );

  @Effect()
  onUpdateStoreSettings = this.actions$.pipe(
    ofType<UpdateStoreSettings>(StoresActionType.UpdateStoreSettings),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    map(([action, id]) => ({
      id,
      settings: Object.keys(action.settings).map(key => ({ key, value: action.settings[key] }))
    })),
    switchMap(r => this.storesService.updateSettings(r.id, r.settings)
      .pipe(
        map(s => new UpdateStoreSettingsSuccess(s)),
        catchError(e => {
          return of(new UpdateStoreSettingsFailed(e.error.errors.map(err => err.message)));
        })
      ))
  );

  @Effect({ dispatch: false })
  onUpdateStoreSettingsSuccess = this.actions$.pipe(
    ofType<UpdateStoreSettingsSuccess>(StoresActionType.UpdateStoreSettingsSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'))),
  );

  @Effect()
  onPartialUpdateStore = this.actions$.pipe(
    ofType<PartialUpdateStore>(StoresActionType.PartialUpdateStore),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.partialUpdate(id, action.clientStore)
      .pipe(
        map(s => new PartialUpdateStoreSuccess(s)),
        catchError(e => {
          if (e.status === 400) {
            return of(new PartialUpdateStoreFailed(e.error.errors.map(err => err.message)));
          }
          return of(new PartialUpdateStoreFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  );
  @Effect()
  onDeleteStore = this.actions$.pipe(
    ofType<DeleteStore>(StoresActionType.DeleteStore),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.deleteStore(id)
      .pipe(
        map(s => new DeleteStoreSuccess(s)),
        catchError(e => {
          if (e.status === 400) {
            return of(new DeleteStoreFailed(e.error.errors.map(err => err.message)));
          }
          return of(new DeleteStoreFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  );
  @Effect({ dispatch: false })
  onDeleteStoreSuccess = this.actions$.pipe(
    ofType<DeleteStoreSuccess>(StoresActionType.DeleteStoreSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.deleteStoreSuccess'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a => this.router.navigateByUrl('/manager/stores/list'))
  );
  @Effect({ dispatch: false })
  onDeleteStoreFailed = this.actions$.pipe(
    ofType<DeleteStoreFailed>(
      StoresActionType.DeleteStoreFailed),
    tap(a =>
      a.error.forEach(e => this.toastr.error(
        this.translateSer.instant(
          'admin.store.deleteStoreMsgError',
          { storeId: e.split(' ')[1] }
        ),
        this.translateSer.instant('admin.store.message.errorTryAgain')
      ))
    ),
    tap(a => this.router.navigateByUrl('/manager/stores/list'))
  );

  @Effect({ dispatch: false })
  onPartialUpdateStoreSuccess = this.actions$.pipe(
    ofType<PartialUpdateStoreSuccess>(StoresActionType.PartialUpdateStoreSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a =>
      this.router.navigate(
        [
          '/manager/stores',
          a.store.id,
          'settings',
          window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
        ]
      )
    )
  );

  @Effect()
  onUpdateStoreVatPercentage = this.actions$.pipe(
    ofType<UpdateStoreVatPercentage>(StoresActionType.UpdateStoreVatPercentage),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.updateStoreVatPercentage(id, action.vatPercentage)
      .pipe(
        map(s => new UpdateStoreVatPercentageSuccess(s)),
        catchError(e => {
          if (e.status === 400) {
            return of(new UpdateStoreVatPercentageFailed(e.error.errors.map(err => err.message)));
          }
          return of(new UpdateStoreVatPercentageFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  );

  @Effect({ dispatch: false })
  onUpdateStoreVatPercentageSuccess = this.actions$.pipe(
    ofType<UpdateStoreVatPercentageSuccess>(StoresActionType.UpdateStoreVatPercentageSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a =>
      this.router.navigate(
        [
          '/manager/stores',
          a.store.id,
          'settings',
          window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
        ]
      )
    )
  );

  @Effect({ dispatch: false })
  onCreateStoreSuccess = this.actions$.pipe(
    ofType<CreateStoreSuccess>(StoresActionType.CreateStoreSuccess),
    tap(a => this.router.navigate(['/manager/stores', a.id, 'register-store-success']))
  );

  @Effect({ dispatch: false })
  onStoreActionFailed = this.actions$.pipe(
    ofType<CreateStoreFailed | UpdateStoreFailed>(
      StoresActionType.CreateStoreFailed,
      StoresActionType.UpdateStoreFailed,
    ),
    tap(a =>
      a.error &&
        (
          a.error.includes('google') ||
          a.error.includes('facebook') ||
          a.error.includes('Invalid extenal domain')
        ) !== true
        ? a.error.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail')))
        : console.log('An error occurred')
    )
  );

  @Effect()
  onDownloadQRImage = this.actions$.pipe(
    ofType<DownloadQRImage>(StoresActionType.DownloadQRImage),
    switchMap(action => this.storesService.downloadQRImage(action.id, action.url)
      .pipe(
        map(s => new DownloadQRImageSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadQRImageFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  );

  @Effect()
  onDownloadQRPdf = this.actions$.pipe(
    ofType<DownloadQRPdf>(StoresActionType.DownloadQRPdf),
    switchMap(action => this.storesService.downloadQRPdf(action.id)
      .pipe(
        map(s => new DownloadQRPdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadQRPdfFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  );

  @Effect()
  onDownloadQRImages = this.actions$.pipe(
    ofType<DownloadQRImages>(StoresActionType.DownloadQRImages),
    switchMap(action => this.storesService.downloadQRImages(action.id)
      .pipe(
        map(s => new DownloadQRImagesSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadQRImagesFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  );

  @Effect()
  onDownloadQRFullPdf = this.actions$.pipe(
    ofType<DownloadQRFullPdf>(StoresActionType.DownloadQRFullPdf),
    switchMap(action => this.storesService.downloadQRFullPdf(action.id)
      .pipe(
        map(s => new DownloadQRFullPdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadQRFullPdfFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  );

  @Effect({ dispatch: false })
  onDownloadFailed = this.actions$.pipe(
    ofType<DownloadQRImageFailed | DownloadQRPdfFailed | DownloadQRImagesFailed | DownloadQRFullPdfFailed>(
      StoresActionType.DownloadQRImageFailed,
      StoresActionType.DownloadQRPdfFailed,
      StoresActionType.DownloadQRImagesFailed,
      StoresActionType.DownloadQRFullPdfFailed
    ),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.downloadFail')))
  );

  @Effect()
  onStoreImageUpload = this.actions$.pipe(
    ofType<UploadStoreImage>(StoresActionType.UploadStoreImage),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([a, s]) => this.storesService.uploadStoreImage(s.id, a.file)
      .pipe(
        map(r => new UploadStoreImageSuccess(r)),
        tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.imageUploadSuccess'))),
        catchError(e => {
          if (e.status === 400) {
            let error;
            try {
              error = JSON.parse(e.error);
              return of(new UploadStoreImageFailed(error.errors.map(er => er.message)));
            } catch (parseErr) {
              return of(new UploadStoreImageFailed(['An error occured in Image uploading, please try again']));
            }

          } else if (e.status === 413) {
            return of(new UploadStoreImageFailed(['File size should not be more than 10 MB']));
          }
          return of(new UploadStoreImageFailed(['An error occured in Image uploading, please try again']));
        }
        )
      )
    )
  );

  @Effect()
  onStoreLogoUpload = this.actions$.pipe(
    ofType<UploadStoreLogo>(StoresActionType.UploadStoreLogo),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([a, s]) => this.storesService.uploadStoreLogo(s.id, a.file)
      .pipe(
        map(r => new UploadStoreLogoSuccess(r)),
        tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.logoUploadSuccess'))),
        catchError(e => {
          if (e.status === 400) {
            let error;
            try {
              error = JSON.parse(e.error);
              return of(new UploadStoreLogoFailed(error.errors.map(er => er.message)));
            } catch (parseErr) {
              return of(new UploadStoreLogoFailed(['An error occured in Logo uploading, please try again']));
            }
          } else if (e.status === 413) {
            return of(new UploadStoreLogoFailed(['File size should not be more than 10 MB']));
          }
          return of(new UploadStoreLogoFailed(['An error occured in Logo uploading, please try again']));
        }
        )
      )
    )
  );

  @Effect({ dispatch: false })
  onStoreImageUploadFailed = this.actions$.pipe(
    ofType<UploadStoreImageFailed | UploadStoreLogoFailed>(
      StoresActionType.UploadStoreImageFailed, StoresActionType.UploadStoreLogoFailed),
    tap(a => a.errorMessages.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.uploadFail'))))
  );

  @Effect()
  onInviteUser = this.actions$.pipe(
    ofType<InviteUser>(StoresActionType.InviteUser),
    switchMap(action =>
      this.storesService.inviteUser(action.email, action.role, action.storeId).pipe(
        map(() => new InviteUserSuccess()),
        catchError(e => {
          return of(new InviteUserFailed(e.error.errors.map(err => err.message)));
        })
      )
    )
  );

  @Effect()
  onInviteUserSuccess = this.actions$.pipe(
    ofType<InviteUserSuccess>(StoresActionType.InviteUserSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.inviteUserSuccess'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    withLatestFrom(this.store.select(getUsersList), this.store.select(getSelectedStore)),
    map(([, users, store]) => new LoadUsersPage(store.id, users.paging))
  );

  @Effect({ dispatch: false })
  onInviteUserFailed = this.actions$.pipe(
    ofType<InviteUserFailed>(StoresActionType.InviteUserFailed),
    tap(a => a.errorMessages.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.inviteUserFail'))))
  );

  @Effect()
  onGetStatusOfZone = this.actions$.pipe(
    ofType<GetStatusOfZone>(StoresActionType.GetStatusOfZone),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, s]) => this.storesService.getStatusOfZone(s.id)
      .pipe(
        map((u: StoreZoneStatus) => new GetStatusOfZoneSuccess(u)),
        catchError(a =>
          of(
            new GetStatusOfZoneFailed(
              a.error.errors
                .map(err => err.message)
                .foreach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail')))
            )
          )
        )
      ))
  );

  @Effect()
  onLoadUsers = this.actions$.pipe(
    ofType<LoadUsers>(StoresActionType.LoadUsers),
    switchMap(action => this.userList(action.storeId, action.paging))
  );



  @Effect()
  onLoadUsersPage = this.actions$.pipe(
    ofType<LoadUsersPage>(StoresActionType.LoadUsersPage),
    switchMap(action => this.userList(action.storeId, action.paging))
  );

  @Effect()
  onRemoveUserStoreAccess = this.actions$.pipe(
    ofType<RemoveUserStoreAccess>(StoresActionType.RemoveUserStoreAccess),
    switchMap(a => this.storesService.removeUserStoreAccess(a.userId, a.storeId)
      .pipe(
        map(() => new RemoveUserStoreAccessSuccess(a.userId, a.storeId)),
        catchError(() => of(new RemoveUserStoreAccessFailed()))
      )
    )
  );

  @Effect()
  onRemoveUserStoreAccessSuccess = this.actions$.pipe(
    ofType<RemoveUserStoreAccessSuccess>(StoresActionType.RemoveUserStoreAccessSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.acessRemoveSuccess'))),
    withLatestFrom(this.store.select(getUsersList), this.store.select(getSelectedStore)),
    map(([, users, store]) => new LoadUsersPage(store.id, users.paging))
  );

  @Effect()
  onRemoveZone = this.actions$.pipe(
    ofType<RemoveZone>(StoresActionType.RemoveZone),
    switchMap(a => this.storesService.removeZone(a.zoneId, a.storeId)
      .pipe(
        map(() => new RemoveZoneSuccess(a.zoneId, a.storeId)),
        catchError(() => of(new RemoveZoneFailed()))
      )
    )
  );

  @Effect()
  onRemoveZoneSuccess = this.actions$.pipe(
    ofType<RemoveZoneSuccess>(StoresActionType.RemoveZoneSuccess),
    tap((a) => {
      this.toastr.success(this.translateSer.instant('admin.store.message.zoneRemoveSuccess'));
      return this.router.navigate(['/manager/stores', a.storeId, 'settings', 'address']);
    }),
    map(a => new LoadStore(a.storeId))
  );


  @Effect({ dispatch: false })
  onRemoveZoneFailed = this.actions$.pipe(
    ofType<RemoveZoneFailed>(StoresActionType.RemoveZoneFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.message.zoneRemoveFail')))
  );


  @Effect({ dispatch: false })
  onRemoveUserStoreAccessFailed = this.actions$.pipe(
    ofType<RemoveUserStoreAccessFailed>(StoresActionType.RemoveUserStoreAccessFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.message.zoneRemoveFail')))
  );

  @Effect()
  onSearchStore = this.actions$.pipe(
    ofType<SearchStores>(StoresActionType.SearchStores),
    switchMap(action => this.storesService.searchStores(action.alias).pipe(
      map(s => new SearchStoresSuccess(s)),
      catchError(a => of(new SearchStoresFailed((!!a.error && !!a.error.errors) ? a.error.errors.map(err => err.message) : '')))
    ))
  );

  @Effect()
  onLoadStoreStatistics = this.actions$.pipe(
    ofType<LoadStoreStatistics>(StoresActionType.LoadStoreStatistics),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, s]) => this.storesService.loadStoreStatistics(s.id, action.duration, action.from, action.to, action.periodicTerm)
      .pipe(
        map((u: StoreStatistics[]) => new LoadStoreStatisticsSuccess(u)),
        catchError(a => of(new LoadStoreStatisticsFailed(a.error.message)))
      ))
  );

  @Effect({ dispatch: false })
  onLoadStoreStatisticsFailed = this.actions$.pipe(
    ofType<LoadStoreStatisticsFailed | LoadStoresFailed | LoadUsersFailed>
      (StoresActionType.LoadStoreStatisticsFailed, StoresActionType.LoadStoresFailed,
        StoresActionType.LoadUsersFailed),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.loadFail')))
  );


  @Effect()
  onValidateAliasAvailability = this.actions$.pipe(
    ofType<ValidateAliasAvailability>(StoresActionType.ValidateAliasAvailability),
    switchMap(action => this.storesService.validateAliasAvailability(action.storeId, action.alias)
      .pipe(
        map((u: AliasAvailabilityStatus) => new ValidateAliasAvailabilitySuccess(u)),
        catchError(() => of(new ValidateAliasAvailabilityFailed(this.translateSer.instant('admin.store.message.downloadFail'))))
      ))
  );

  @Effect()
  onLoadNotificationSubscriptionStatus = this.actions$.pipe(
    ofType<LoadNotificationSubscriptionStatus>(StoresActionType.LoadNotificationSubscriptionStatus),
    tap(_ => console.log('loading subscription status')),
    tap(action => console.log('action, subscription', action)),
    switchMap(action => {
      if (!action.pushSubscription) {
        console.log('no active subscription found');
        return of(new LoadNotificationSubscriptionStatusSuccess(false));
      } else {
        return this.storesService.loadNotificationSubscriptionStatus(action.storeId, action.pushSubscription).pipe(
          map(res => new LoadNotificationSubscriptionStatusSuccess(res)),
          catchError(a => of(new LoadNotificationSubscriptionStatusFailed(a.error.errors.map(err => err.message)))));
      }
    })
  );

  @Effect()
  onRequestNotificationPermission = this.actions$.pipe(
    ofType<RequestNotificationPermission>(StoresActionType.RequestNotificationPermission),
    switchMap(() => this.pushNotificationService.requestPermission().pipe(
      map(pushSubscription => new ToggleNotificationSubscriptionStatus(true, pushSubscription)),
      catchError(e => { console.log('error requesting permissions', e); return of(new ToggleNotificationPermitted(false)); })
    ))
  );

  @Effect()
  onToggleNotificationSubscriptionStatus = this.actions$.pipe(
    ofType<ToggleNotificationSubscriptionStatus>(StoresActionType.ToggleNotificationSubscriptionStatus),
    withLatestFrom(this.store.select(getSelectedStore)),
    filter(([action, store]) => action.pushSubscription != null),
    switchMap(([action, store]) => {
      console.log('action, store', action, store);
      if (action.newStatus) {
        console.log('subscribing to notifications');
        return this.storesService.subscribeNotification(store.id, action.pushSubscription).pipe(
          map(_ => new ToggleNotificationSubscriptionStatusSuccess(true))
        );
      } else {
        console.log('unsubscribing from notifications');
        return this.storesService.unsubscribeNotification(store.id, action.pushSubscription).pipe(
          map(_ => new ToggleNotificationSubscriptionStatusSuccess(false))
        );
      }

    })
  );


  @Effect()
  onCreateOrUpdateZone = this.actions$.pipe(
    ofType<CreateOrUpdateZone>(StoresActionType.CreateOrUpdateZone),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storesService.createOrUpdateZone(store.id, action.zoneSetting, action.id)
      .pipe(
        map(() => new CreateOrUpdateZoneSuccess(store.id, action.id)),
        catchError(e => {
          if (e.status === 400) {
            if (e.error == null) {
              return of(new CreateOrUpdateZoneFailed(e.statusText.split()));
            } else {
              return of(new CreateOrUpdateZoneFailed(e.error.errors.map(err => err.message)));
            }
          }
          if (e.status === 500) {
            return of(new CreateOrUpdateZoneFailed(e.error.errors.map(err => err.message)));
          }
          return of(new CreateOrUpdateZoneFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );


  @Effect()
  onCreateOrUpdateZoneSuccess = this.actions$.pipe(
    ofType<CreateOrUpdateZoneSuccess>(StoresActionType.CreateOrUpdateZoneSuccess),
    tap((a) => {
      if (a.storeId) {
        if (a.zoneId === 0) {
          this.toastr.success(this.translateSer.instant('admin.store.message.zoneAdded'));
        } else {
          this.toastr.success(this.translateSer.instant('admin.store.message.zoneUpdated'));
        }
        return this.router.navigate(['/manager/stores', a.storeId, 'settings', 'address']);
      }
    }),
    map(a => new LoadStore(a.storeId), new LoadZones())
  );

  @Effect({ dispatch: false })
  onCreateOrUpdateZoneFailed = this.actions$.pipe(
    ofType<CreateOrUpdateZoneFailed>(
      StoresActionType.CreateOrUpdateZoneFailed,
    ),
    tap(a => a.error.forEach((e, index) => {
      if (e.includes('size must be between 3 ') || e.includes('Mandatory information not present')) {
        if (index === 0) {
          this.toastr.error(this.translateSer.instant('admin.store.settingsMaperrormsg'));
        }
      }
      else if (e.toLowerCase().includes('radius range')) {
        this.toastr.error(this.translateSer.instant('admin.store.invalidRadiusRange'), this.translateSer.instant('admin.store.message.actionFail'));
      }
      else {
        this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail'));
      }
    }
    )));
  @Effect()
  onLoadZone = this.actions$.pipe(
    ofType<LoadZone>(StoresActionType.LoadZone),
    switchMap(action => this.storesService.loadZone(action.storeId, action.id).pipe(
      map(s => new LoadZoneSuccess(s)),
      catchError(a => of(new LoadZoneFailed()))
    ))
  );

  @Effect()
  onLoadZones = this.actions$.pipe(
    ofType<LoadZones>(StoresActionType.LoadZones),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, s]) => this.storesService.loadZones(s.id)
      .pipe(
        map((u: StoreZone[]) => new LoadZonesSuccess(u)),
        catchError(a => of(new LoadZonesFailed(a.error.errors.map(err => err.message))))
      ))
  );

  @Effect({ dispatch: false })
  onLoadZonesFailed = this.actions$.pipe(
    ofType<LoadZonesFailed>
      (StoresActionType.LoadZonesFailed),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.loadFail')))
  );


  @Effect()
  onRemoveStoreLogo = this.actions$.pipe(
    ofType<RemoveStoreLogo>(StoresActionType.RemoveStoreLogo),
    switchMap(a => this.storesService.removeStoreLogo(a.storeId)
      .pipe(
        map(r => new RemoveStoreLogoSuccess(a.storeId)),
        catchError(e => of(new RemoveStoreLogoFailed()))
      )
    )
  );

  @Effect({ dispatch: false })
  onRemoveStoreLogoSuccess = this.actions$.pipe(
    ofType<RemoveStoreLogoSuccess>(StoresActionType.RemoveStoreLogoSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.logoRemoveSuccess')))
  );

  @Effect({ dispatch: false })
  onRemoveStoreLogoFailed = this.actions$.pipe(
    ofType<RemoveStoreLogoFailed>(StoresActionType.RemoveStoreLogoFailed),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.actionFail')))
  );


  @Effect()
  onRemoveStoreImage = this.actions$.pipe(
    ofType<RemoveStoreImage>(StoresActionType.RemoveStoreImage),
    switchMap(a => this.storesService.removeStoreImage(a.storeId)
      .pipe(
        map(r => new RemoveStoreImageSuccess(a.storeId)),
        catchError(e => of(new RemoveStoreImageFailed()))
      )
    )
  );

  @Effect({ dispatch: false })
  onRemoveStoreImageSuccess = this.actions$.pipe(
    ofType<RemoveStoreImageSuccess>(StoresActionType.RemoveStoreImageSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.imageRemoveSuccess')))
  );

  @Effect({ dispatch: false })
  onRemoveStoreImageFailed = this.actions$.pipe(
    ofType<RemoveStoreImageFailed>(StoresActionType.RemoveStoreImageFailed),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.actionFail')))
  );

  @Effect()
  onLoadOrderItemsStatisticsPage = this.actions$.pipe(
    ofType<LoadOrderItemsStatisticsPage>(StoresActionType.LoadOrderItemsStatisticsPage),
    switchMap(action =>
      this.orderItemsStatisticsList(
        action.id,
        action.startDate,
        action.endDate,
        action.orderItemDateType,
        action.paging,
        action.sort
      )
    )
  );

  @Effect({ dispatch: false })
  onLoadOrderItemsStatisticsFailed = this.actions$.pipe(
    ofType<LoadOrderItemsStatisticsFailed | LoadStoresFailed | LoadUsersFailed>
      (StoresActionType.LoadOrderItemsStatisticsFailed, StoresActionType.LoadStoresFailed,
        StoresActionType.LoadUsersFailed),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.loadFail')))
  );

  @Effect()
  onLoadStoresPage = this.actions$.pipe(
    ofType<LoadStoresPage>(StoresActionType.LoadStoresPage),
    switchMap(action => this.list(action.paging, action.aliasName))
  );

  private orderItemsStatisticsList(
    id: number,
    startDate: string,
    endDate: string,
    orderItemDateType: string,
    paging: Paging,
    sort: string,
  ) {
    return this.storesService.orderItemsStatisticsList(id, startDate, endDate, orderItemDateType, paging, sort)
      .pipe(
        map(s => new LoadOrderItemsStatisticsSuccess(s)),
        catchError(a => of(new LoadOrderItemsStatisticsFailed(a.error.errors.map(err => err.message))))
      );
  }

  private list(paging: Paging, aliasName: string) {
    return this.storesService.list(paging, aliasName).pipe(
      map(s => new LoadStoresSuccess(s)),
      catchError(a => of(new LoadStoresFailed((!!a.error && !!a.error.errors) ? a.error.errors.map(err => err.message) : '')))
    );
  }

  private userList(id: number, paging: Paging) {
    return this.storesService.userList(id, paging).pipe(
      map(s => new LoadUsersSuccess(s)),
      catchError(a => of(new LoadUsersFailed(a.error.errors.map(err => err.message))))
    );
  }





  @Effect()
  onOrderItemsXls = this.actions$.pipe(
    ofType<DownloadOrderItemsXls>(StoresActionType.DownloadOrderItemsXls),
    switchMap(action => this.storesService.downloadOrderItemXls(action.storeId, action.orderItemReportType, action.fromDate, action.toDate)
      .pipe(
        map(s => {
          return new DownloadOrderItemsXlsSuccess(s.blob, decodeURIComponent(s.filename));
        }),
        catchError(a => of(new DownloadOrderItemsXlsFailed(this.translateSer.instant('admin.store.catalog.contentDownload'))))
      ))
  );

  @Effect({ dispatch: false })
  onOrderItemsXlsFailed = this.actions$.pipe(
    ofType<DownloadOrderItemsXlsFailed>(
      StoresActionType.DownloadOrderItemsXlsFailed,
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  );

  @Effect({ dispatch: false })
  onUpdateStoreSettingsFailed = this.actions$.pipe(
    ofType<UpdateStoreSettingsFailed>(
      StoresActionType.UpdateStoreSettingsFailed,
    ),
    tap(a =>
      a.error &&
        !(a.error.some(x => x.includes('google') ||
          x.includes('facebook') ||
          x.includes('Website') ||
          x.includes('Facebook') ||
          x.includes('Instagram') ||
          x.includes('Cardito') ||
          x.includes('Invalid iOS Store URL') ||
          x.includes('Invalid Android Store URL')))
        ? a.error.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail')))
        : console.log('An error occurred')
    )
  );

  @Effect()
  onUpdateStoreZoneSettings = this.actions$.pipe(
    ofType<UpdateStoreZoneSettings>(StoresActionType.UpdateStoreZoneSettings),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    map(([action, id]) => ({
      zoneId: action.id,
      id,
      settings: Object.keys(action.settings).map(key => ({ key, value: action.settings[key] }))
    })),
    switchMap(r => this.storesService.updateZoneSettings(r.zoneId, r.id, r.settings)
      .pipe(
        map(s => new UpdateStoreZoneSettingsSuccess(s)),
        catchError(e => of(new UpdateStoreZoneSettingsFailed(e.error.errors.map(err => err.message))))
      ))
  );

  @Effect({ dispatch: false })
  onUpdateStoreZoneSettingsSuccess = this.actions$.pipe(
    ofType<UpdateStoreZoneSettingsSuccess>(StoresActionType.UpdateStoreZoneSettingsSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect()
  mynextLogin = this.actions$.pipe(
    ofType<MynextLogin>(StoresActionType.MynextLogin),
    switchMap(action => (
      action.username && action.password ? this.storesService.mynextLogin(action.username, action.password) : (
        of(
          {
            ApiKey: undefined,
            MyNextId: undefined,
            Message: undefined
          }
        )
      )
    )
      .pipe(
        map(t => new MynextLoginSuccess(t)),
        catchError(a => of(new MynextLoginFailed()))
      ))
  );
  @Effect()
  powersoftLogin = this.actions$.pipe(
    ofType<PowersoftLogin>(StoresActionType.PowersoftLogin),
    switchMap(action => (
      this.storesService.powersoftLogin(action.storeId, action.reqObj)
    )
      .pipe(
        map(t => new PowersoftLoginSuccess(t as any)),
        catchError(a => of(new PowersoftLoginFailed(a.error.errors.map(err => this.toastr.error(err.message)))
      ))
      ))
  );

   @Effect({ dispatch: false })
  onPowersoftLoginSuccess = this.actions$.pipe(
    ofType<PowersoftLoginSuccess>(StoresActionType.PowersoftLoginSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate')))
  );

  @Effect()
  disconnectPowersoft = this.actions$.pipe(
    ofType<DisconnectPowersoft>(StoresActionType.DisconnectPowersoft),
    switchMap(action => (
      this.storesService.disconnectPowersoft(action.storeId)
    )
      .pipe(
        map(t => new DisconnectPowersoftSuccess(t as any)),
        catchError(a => of(new DisconnectPowersoftFailed(a.error.errors.map(err => this.toastr.error(err.message)))
      ))
      ))
  );

   @Effect({ dispatch: false })
  onDisconnectPowersoftSuccess = this.actions$.pipe(
    ofType<DisconnectPowersoftSuccess>(StoresActionType.DisconnectPowersoftSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate')))
  );


  @Effect()
  hubriseLogin = this.actions$.pipe(
    ofType<HubriseLogin>(StoresActionType.HubriseLogin),
    switchMap(action => this.storesService.hubriseLogin(action.storeId, action.authCode)
      .pipe(
        map(t => new HubriseLoginSuccess(t)),
        catchError(() => of(new HubriseLoginFailed()))
      ))
  );

  @Effect()
  hubriseLogout = this.actions$.pipe(
    ofType<HubriseLogout>(StoresActionType.HubriseLogout),
    switchMap(action => this.storesService.hubriseLogout(action.storeId)
      .pipe(
        map(t => new HubriseLogoutSuccess(t)),
        catchError(() => of(new HubriseLogoutFailed()))
      ))
  );

  @Effect()
  onLoadCustomersPage = this.actions$.pipe(
    ofType<LoadCustomersPage>(StoresActionType.LoadCustomersPage),
    switchMap(
      action => this.storesService.customersList(
        action.storeId, action.email, action.name, action.phoneNumber, action.sortingColumn, action.paging
      ).pipe(
        map(s => new LoadCustomersSuccess(s)),
        catchError(
          a => of(new LoadCustomersFailed(a.error.errors.map(err => this.toastr.error(err.message)))
        ))
      ))
  );

  @Effect()
  onCustomersDownload = this.actions$.pipe(
    ofType<DownloadCustomersList>(StoresActionType.DownloadCustomersList),
    switchMap(action => this.storesService.downloadCustomersList(action.storeId, action.email, action.name, action.phoneNumber)
      .pipe(
        map(s => new DownloadCustomersListSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadCustomersListFailed('Customers list Download Failed')))
      ))
  );

  @Effect({ dispatch: false })
  onCustomersDownloadFailed = this.actions$.pipe(
    ofType<DownloadCustomersListFailed>(
      StoresActionType.DownloadCustomersListFailed,
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  );

  @Effect()
  onDownloadFlyerPdf = this.actions$.pipe(
    ofType<DownloadFlyerFile>(StoresActionType.DownloadFlyerFile),
    switchMap(action => this.storesService.downloadOrRenderFlyerImage(action.storeId, action.voucherCode)
      .pipe(
        map(s => new DownloadFlyerFileSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadFlyerFileFailed('An error occured. Please try again')))
      ))
  );
}
