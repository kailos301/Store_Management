import { Router } from '@angular/router';
import { switchMap, map, catchError, tap, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { StoresScheduleService } from '../stores-schedule.service';
import {
  StoreScheduleActionType,
  LoadSchedules,
  LoadSchedulesSuccess,
  LoadSchedulesFailed,
  CreateSchedule,
  CreateScheduleSuccess,
  CreateScheduleFailed,
  UpdateSchedule,
  UpdateScheduleSuccess,
  UpdateScheduleFailed,
  LoadSchedule,
  LoadScheduleSuccess,
  LoadScheduleFailed,
  DeleteSchedule,
  DeleteScheduleSuccess,
  DeleteScheduleFailed,
  CreateSpecialSchedule,
  CreateSpecialScheduleFailed,
  UpdateSpecialSchedule,
  UpdateSpecialScheduleSuccess,
  UpdateSpecialScheduleFailed,
  LoadSpecialSchedule,
  LoadSpecialScheduleFailed,
  DeleteSpecialSchedule,
  DeleteSpecialScheduleFailed,
  LoadOpeningScheduleSuccess,
  LoadAddressDeliveryScheduleSuccess,
  LoadPickupScheduleSuccess,
  LoadServingScheduleSuccess,
  DeleteOpeningScheduleSuccess,
  DeleteAddressDeliveryScheduleSuccess,
  DeletePickupScheduleSuccess,
  DeleteServingScheduleSuccess,
  CreateOpeningScheduleSuccess,
  CreateAddressDeliveryScheduleSuccess,
  CreatePickupScheduleSuccess,
  CreateServingScheduleSuccess,
  LoadOpeningSchedule,
  LoadAddressDeliverySchedule,
  LoadPickupSchedule,
  LoadServingSchedule,
} from './stores-schedule.actions';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { getSelectedStore } from '../../+state/stores.selectors';

@Injectable()
export class StoreScheduleEffects {

  constructor(
    private actions$: Actions,
    private scheduleService: StoresScheduleService,
    private toastr: ToastrService,
    private router: Router,
    private store: Store<any>,
    private translateSer: TranslateService) { }



  @Effect()
  onLoadSchedules = this.actions$.pipe(
    ofType<LoadSchedules>(StoreScheduleActionType.LoadSchedules),
    switchMap(action => this.scheduleService.getAllSchedules(action.id).pipe(
      map(s => new LoadSchedulesSuccess(s)),
      catchError(e => of(new LoadSchedulesFailed(e.error.errors.map((err: { message: any; }) => err.message))))
    ))
  );

  @Effect()
  onLoadSchedulesSuccess = this.actions$.pipe(
    ofType<LoadSchedulesSuccess>(StoreScheduleActionType.LoadSchedulesSuccess),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, selectedStore]) => {
      return [
        new LoadOpeningSchedule('OPENING_HOURS', selectedStore.id),
        new LoadServingSchedule('SERVING_HOURS', selectedStore.id),
        new LoadPickupSchedule('PICKUP_HOURS', selectedStore.id),
        new LoadAddressDeliverySchedule('ADDRESS_DELIVERY_HOURS', selectedStore.id),
      ];
    })
  );

  @Effect({ dispatch: false })
  onLoadSchedulesFailed = this.actions$.pipe(
    ofType<LoadSchedulesFailed>(StoreScheduleActionType.LoadSchedulesFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.catalog.error.loadSchedules')))
  );

  @Effect()
  onLoadSchedule = this.actions$.pipe(
    ofType<LoadSchedule>(StoreScheduleActionType.LoadSchedule),
    switchMap(action => this.scheduleService.getSchedule(action.scheduleId, action.storeId).pipe(
      map(s => new LoadScheduleSuccess(s)),
      catchError(e => of(new LoadScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
    ))
  );

  @Effect({ dispatch: false })
  onLoadScheduleFailed = this.actions$.pipe(
    ofType<LoadScheduleFailed>(StoreScheduleActionType.LoadScheduleFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.catalog.error.loadSchedules')))
  );

  @Effect()
  onCreateSchedule = this.actions$.pipe(
    ofType<CreateSchedule>(StoreScheduleActionType.CreateSchedule),
    switchMap(action => this.scheduleService.addSchedule(action.schedule, action.storeId)
      .pipe(
        map(s => new CreateScheduleSuccess(s, action.storeId)),
        catchError(e => of(new CreateScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      ))
  );

  @Effect({ dispatch: false })
  onCreateScheduleSuccess = this.actions$.pipe(
    ofType<CreateScheduleSuccess>(StoreScheduleActionType.CreateScheduleSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.CreateScheduleSuccess'))),
    tap(z => {
      window.history.back();
    })
  );

  @Effect({ dispatch: false })
  onCreateScheduleFailed = this.actions$.pipe(
    ofType<CreateScheduleFailed>(StoreScheduleActionType.CreateScheduleFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.catalog.error.createSchedule')))
  );

  @Effect()
  onUpdateSchedule = this.actions$.pipe(
    ofType<UpdateSchedule>(StoreScheduleActionType.UpdateSchedule),
    switchMap(action => this.scheduleService.updateSchedule(action.schedule, action.storeId)
      .pipe(
        map(s => new UpdateScheduleSuccess(s)),
        catchError(e => of(new UpdateScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      ))
  );

  @Effect({ dispatch: false })
  onUpdateScheduleSuccess = this.actions$.pipe(
    ofType<UpdateScheduleSuccess>(StoreScheduleActionType.UpdateScheduleSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.updateScheduleSuccess'))),
    tap(z => {
      window.history.back();
    })
  );

  @Effect({ dispatch: false })
  onUpdateScheduleFailed = this.actions$.pipe(
    ofType<UpdateScheduleFailed>(StoreScheduleActionType.UpdateScheduleFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.catalog.error.updateSchedule')))
  );
  @Effect()
  onDeleteSchedule = this.actions$.pipe(
    ofType<DeleteSchedule>(StoreScheduleActionType.DeleteSchedule),
    switchMap(a => this.scheduleService.deleteSchedule(a.scheduleId, a.storeId)
      .pipe(
        map(() => new DeleteScheduleSuccess(a.storeId)),
        catchError(e => of(new DeleteScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      )
    )
  );

  @Effect({ dispatch: false })
  onDeleteScheduleSuccess = this.actions$.pipe(
    ofType<DeleteScheduleSuccess>(StoreScheduleActionType.DeleteScheduleSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.deleteScheduleSuccess'))),
    tap(z => {
      this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'schedules']);
    })
  );


  @Effect({ dispatch: false })
  onDeleteScheduleFailed = this.actions$.pipe(
    ofType<DeleteScheduleFailed>(StoreScheduleActionType.DeleteScheduleFailed),
    tap(error => {
      if (error.errors) {
        error.errors.forEach(e => this.toastr.error(e));
      } else {
        this.toastr.error(this.translateSer.instant('admin.store.catalog.error.deleteSchedule'));
      }
    })
  );

  @Effect()
  onCreateSpecialSchedule = this.actions$.pipe(
    ofType<CreateSpecialSchedule>(StoreScheduleActionType.CreateSpecialSchedule),
    switchMap(a => this.scheduleService.addSpecialSchedule(a.specialScheduleType, a.scheduleId, a.storeId)
      .pipe(
        map((z) => {
          if (a.specialScheduleType === 'OPENING_HOURS') {
            return new CreateOpeningScheduleSuccess(z);
          }
          if (a.specialScheduleType === 'ADDRESS_DELIVERY_HOURS') {
            return new CreateAddressDeliveryScheduleSuccess(z);
          }
          if (a.specialScheduleType === 'PICKUP_HOURS') {
            return new CreatePickupScheduleSuccess(z);
          }
          if (a.specialScheduleType === 'SERVING_HOURS') {
            return new CreateServingScheduleSuccess(z);
          }
        }),
        catchError(e => of(new CreateSpecialScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      )
    )
  );

  @Effect({ dispatch: false })
  onCreateSpecialScheduleSuccess = this.actions$.pipe(
    ofType<CreateOpeningScheduleSuccess | CreateAddressDeliveryScheduleSuccess | CreatePickupScheduleSuccess | CreateServingScheduleSuccess>
    (
      StoreScheduleActionType.CreateOpeningScheduleSuccess,
      StoreScheduleActionType.CreateAddressDeliveryScheduleSuccess,
      StoreScheduleActionType.CreatePickupScheduleSuccess,
      StoreScheduleActionType.CreateServingScheduleSuccess
    ),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.schedule.CreateSpecialScheduleSuccess')))
  );


  @Effect({ dispatch: false })
  onCreateSpecialScheduleFailed = this.actions$.pipe(
    ofType<CreateSpecialScheduleFailed>(StoreScheduleActionType.CreateSpecialScheduleFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.schedule.error.CreateSpecialSchedule')))
  );

  @Effect()
  onUpdateSpecialSchedule = this.actions$.pipe(
    ofType<UpdateSpecialSchedule>(StoreScheduleActionType.UpdateSpecialSchedule),
    switchMap(a => this.scheduleService.updateSpecialSchedule(a.specialScheduleId, a.specialScheduleType, a.scheduleId, a.storeId)
      .pipe(
        map(() => new UpdateSpecialScheduleSuccess()),
        catchError(e => of(new UpdateSpecialScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      )
    )
  );

  @Effect({ dispatch: false })
  onUpdateSpecialScheduleSuccess = this.actions$.pipe(
    ofType<UpdateSpecialScheduleSuccess>(StoreScheduleActionType.UpdateSpecialScheduleSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.schedule.CreateSpecialScheduleSuccess')))
  );


  @Effect({ dispatch: false })
  onUpdateSpecialScheduleFailed = this.actions$.pipe(
    ofType<UpdateSpecialScheduleFailed>(StoreScheduleActionType.UpdateSpecialScheduleFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.schedule.error.CreateSpecialSchedule')))
  );

  @Effect()
  onLoadOpeningSchedule = this.actions$.pipe(
    ofType<LoadSpecialSchedule>(StoreScheduleActionType.LoadOpeningSchedule),
    switchMap(a => this.scheduleService.getSpecialSchedule(a.specialScheduleType, a.storeId)
      .pipe(
        map(s => new LoadOpeningScheduleSuccess(s)),
        catchError(e => of(new LoadSpecialScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      ))
  );

  @Effect()
  onLoadServingSchedule = this.actions$.pipe(
    ofType<LoadSpecialSchedule>(StoreScheduleActionType.LoadServingSchedule),
    switchMap(a => this.scheduleService.getSpecialSchedule(a.specialScheduleType, a.storeId)
      .pipe(
        map(s => new LoadServingScheduleSuccess(s)),
        catchError(e => of(new LoadSpecialScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      ))
  );

  @Effect()
  onLoadPickupSchedule = this.actions$.pipe(
    ofType<LoadSpecialSchedule>(StoreScheduleActionType.LoadPickupSchedule),
    switchMap(a => this.scheduleService.getSpecialSchedule(a.specialScheduleType, a.storeId)
      .pipe(
        map(s => new LoadPickupScheduleSuccess(s)),
        catchError(e => of(new LoadSpecialScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      ))
  );

  @Effect()
  onLoadAddressDeliverySchedule = this.actions$.pipe(
    ofType<LoadSpecialSchedule>(StoreScheduleActionType.LoadAddressDeliverySchedule),
    switchMap(a => this.scheduleService.getSpecialSchedule(a.specialScheduleType, a.storeId)
      .pipe(
        map(s => new LoadAddressDeliveryScheduleSuccess(s)),
        catchError(e => of(new LoadSpecialScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      ))
  );

  @Effect({ dispatch: false })
  onLoadSpecialScheduleFailed = this.actions$.pipe(
    ofType<LoadSpecialScheduleFailed>(StoreScheduleActionType.LoadSpecialScheduleFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.schedule.error.LoadSpecialSchedule')))
  );

  @Effect()
  onDeleteSpecialSchedule = this.actions$.pipe(
    ofType<DeleteSpecialSchedule>(StoreScheduleActionType.DeleteSpecialSchedule),
    switchMap(a => this.scheduleService.deleteSpecialSchedule(a.specialScheduleId, a.storeId)
      .pipe(
        map(() => {
          if (a.specialType === 'OPENING_HOURS') {
            return new DeleteOpeningScheduleSuccess();
          }
          if (a.specialType === 'ADDRESS_DELIVERY_HOURS') {
            return new DeleteAddressDeliveryScheduleSuccess();
          }
          if (a.specialType === 'PICKUP_HOURS') {
            return new DeletePickupScheduleSuccess();
          }
          if (a.specialType === 'SERVING_HOURS') {
            return new DeleteServingScheduleSuccess();
          }
        }),
        catchError(e => of(new DeleteSpecialScheduleFailed(e.error.errors.map((err: { message: any; }) => err.message))))
      )
    ),
  );

  @Effect({ dispatch: false })
  onDeleteSpecialScheduleSuccess = this.actions$.pipe(
    ofType<DeleteOpeningScheduleSuccess | DeleteAddressDeliveryScheduleSuccess | DeletePickupScheduleSuccess | DeleteServingScheduleSuccess>
      (StoreScheduleActionType.DeleteOpeningScheduleSuccess, StoreScheduleActionType.DeleteAddressDeliveryScheduleSuccess,
        StoreScheduleActionType.DeletePickupScheduleSuccess, StoreScheduleActionType.DeleteServingScheduleSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.schedule.DeleteSpecialScheduleSuccess')))
  );

  @Effect({ dispatch: false })
  onDeleteSpecialScheduleFailed = this.actions$.pipe(
    ofType<DeleteSpecialScheduleFailed>(StoreScheduleActionType.DeleteSpecialScheduleFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.schedule.error.DeleteSpecialSchedule')))
  );
}
