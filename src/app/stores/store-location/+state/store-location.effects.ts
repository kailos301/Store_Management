import { getSelectedStore } from './../../+state/stores.selectors';
import { switchMap, map, catchError, tap, withLatestFrom, flatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, ofType, Actions } from '@ngrx/effects';
import {
  StoreLocationActionType, LoadStoreLocations, CreateStoreLocation, CreateStoreLocationSuccess,
  CreateStoreLocationFailed, LoadStoreLocationsSuccess, LoadStoreLocationsFail, CloseStoreLocationCreationForm,
  LoadStoreLocationsPage, UpdateStoreLocation, UpdateStoreLocationSuccess, UpdateStoreLocationFailed, LoadSelectedStoreLocation,
  LoadSelectedStoreLocationSuccess, LoadSelectedStoreLocationFailed, DownloadLocationQRImage, DownloadLocationQRImageSuccess,
  DownloadLocationQRImageFailed, DownloadLocationQRPdf, DownloadLocationQRPdfSuccess, DownloadLocationQRPdfFailed,
  DeleteStoreLocation, DeleteStoreLocationSuccess, DeleteStoreLocationFailed } from './store-location.actions';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Paging } from 'src/app/api/types/Pageable';
import { StoreLocationService } from '../store-location.service';
import { select, Store } from '@ngrx/store';
import { getStoreLocationsList, getSelectedStoreLocation } from './store-location.selectors';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class StoreLocationEffects {

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private storesService: StoreLocationService,
    private toastr: ToastrService,
    private router: Router,
    private translateSer: TranslateService) { }

  @Effect()
  onLoadStoreLocations = this.actions$.pipe(
    ofType<LoadStoreLocations>(StoreLocationActionType.LoadStoreLocations),
    switchMap(action => this.list(action.selectedStoreId, action.paging))
  );

  @Effect()
  onLoadStoreLocationsPage = this.actions$.pipe(
    ofType<LoadStoreLocationsPage>(StoreLocationActionType.LoadStoreLocationsPage),
    withLatestFrom(this.store.pipe(select(getSelectedStore))),
    switchMap(([action, store]) => this.list(store.id, action.paging))
  );

  @Effect()
  onLoadSelectedStoreLocation = this.actions$.pipe(
    ofType<LoadSelectedStoreLocation>(StoreLocationActionType.LoadSelectedStoreLocation),
    switchMap(action => this.storesService.get(action.storeId, action.locationId)
      .pipe(
        map(l => new LoadSelectedStoreLocationSuccess(l)),
        catchError(e => {
          return of(new LoadSelectedStoreLocationFailed());
        })
      ))
  );

  @Effect()
  onCreateStoreLocation = this.actions$.pipe(
    ofType<CreateStoreLocation>(StoreLocationActionType.CreateStoreLocation),
    withLatestFrom(this.store.pipe(select(getSelectedStore))),
    switchMap(([action, store]) => this.storesService.create(store.id, action.clientStoreLocation)
      .pipe(
        map(s => new CreateStoreLocationSuccess(s)),
        catchError(e => {
          if (e.status === 400) {
            return of(new CreateStoreLocationFailed(e.error.errors[0].message));
          }
          return of(new CreateStoreLocationFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect()
  onUpdateStoreLocation = this.actions$.pipe(
    ofType<UpdateStoreLocation>(StoreLocationActionType.UpdateStoreLocation),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getSelectedStoreLocation))),
    switchMap(([action, store, location]) => this.storesService.update(store.id, location.id, action.request)
      .pipe(
        map(l => new UpdateStoreLocationSuccess(l)),
        catchError(e => {
          if (e.status === 400) {
            return of(new UpdateStoreLocationFailed(e.error.errors[0].message));
          }
          return of(new UpdateStoreLocationFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect()
  onCreateStoreLocationSuccess = this.actions$.pipe(
    ofType<CreateStoreLocationSuccess>(StoreLocationActionType.CreateStoreLocationSuccess),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getStoreLocationsList))),
    tap(([a, store, locations]) => {
      this.toastr.success(
        this.translateSer.instant('admin.store.message.locationCreateSuccess',
        { label: a.clientStoreLocations[0].label }),
        this.translateSer.instant('admin.alerts.headerSuccess')
      );
      this.router.navigate([`/manager/stores/${store.id}/locations`]);
    }),
    flatMap(([action, store, locations]) => [new CloseStoreLocationCreationForm(), new LoadStoreLocations(store.id, locations.paging)])
  );

  @Effect({ dispatch: false })
  onUpdateStoreLocationSuccess = this.actions$.pipe(
    ofType<UpdateStoreLocationSuccess>(StoreLocationActionType.UpdateStoreLocationSuccess),
    withLatestFrom(this.store.pipe(select(getSelectedStore))),
    tap(([a, store]) => {
      this.toastr.success(
        this.translateSer.instant('admin.store.message.locationUpdateSuccess',
        { label: a.location.label }),
        this.translateSer.instant('admin.alerts.headerSuccess')
      );
    }),
    map(([action, store]) =>  this.router.navigate(['/manager/stores', store.id, 'locations']))
  );

  @Effect()
  onDeleteStoreLocation = this.actions$.pipe(
    ofType<DeleteStoreLocation>(StoreLocationActionType.DeleteStoreLocation),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getSelectedStoreLocation))),
    switchMap(([action, store, location]) => this.storesService.delete(store.id, action.id)
      .pipe(
        map(l => new DeleteStoreLocationSuccess(location.label)),
        catchError(e => {
          if (e.status === 400) {
            return of(new DeleteStoreLocationFailed(e.error.errors[0].message));
          }
          return of(new DeleteStoreLocationFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect({ dispatch: false })
  onDeleteStoreLocationSuccess = this.actions$.pipe(
    ofType<DeleteStoreLocationSuccess>(StoreLocationActionType.DeleteStoreLocationSuccess),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getStoreLocationsList))),
    tap(([a, store, locations]) => {
      if (locations.data.length === 1) {
        const warningString = ''.concat((this.translateSer.instant('admin.store.message.locationDeleteSuccess', { label: a.label }))
                              + '. ' + this.translateSer.instant('admin.store.message.noInStoreDelivery') + '');
        this.toastr.warning(warningString, this.translateSer.instant('admin.alerts.headerSuccess'));
      } else {
        this.toastr.success(
          this.translateSer.instant('admin.store.message.locationDeleteSuccess',
          { label: a.label }), this.translateSer.instant('admin.alerts.headerSuccess')
        );
      }
    }),
    map(([a, store]) => this.router.navigate(['/manager/stores', store.id, 'locations']))
  );

  @Effect({ dispatch: false })
  onStoreLocationActionFailed = this.actions$.pipe(
    ofType<CreateStoreLocationFailed | UpdateStoreLocationFailed | DeleteStoreLocationFailed>(
      StoreLocationActionType.CreateStoreLocationFailed,
      StoreLocationActionType.UpdateStoreLocationFailed,
      StoreLocationActionType.DeleteStoreLocationFailed
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  );

  @Effect()
  onDownloadLocationQRImage = this.actions$.pipe(
    ofType<DownloadLocationQRImage>(StoreLocationActionType.DownloadLocationQRImage),
    switchMap(action => this.storesService.downloadQRImage(action.storeId, action.locationId)
      .pipe(
        map(s => new DownloadLocationQRImageSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadLocationQRImageFailed('An error occured. Please try again')))
      ))
  );

  @Effect()
  onDownloadLocationQRPdf = this.actions$.pipe(
    ofType<DownloadLocationQRPdf>(StoreLocationActionType.DownloadLocationQRPdf),
    switchMap(action => this.storesService.downloadQRPdf(action.storeId, action.locationId)
      .pipe(
        map(s => new DownloadLocationQRPdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadLocationQRPdfFailed('An error occured. Please try again')))
      ))
  );

  @Effect({ dispatch: false })
  onLocationQRCodeDownloadFailed = this.actions$.pipe(
    ofType<DownloadLocationQRImageFailed | DownloadLocationQRPdfFailed>(
      StoreLocationActionType.DownloadLocationQRImageFailed,
      StoreLocationActionType.DownloadLocationQRPdfFailed
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  );


  private list(storeId: number, paging: Paging) {
    return this.storesService.list(storeId, paging).pipe(
      map(s => new LoadStoreLocationsSuccess(s)),
      catchError(a => of(new LoadStoreLocationsFail()))
    );
  }

}
