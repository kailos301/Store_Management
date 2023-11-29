import {
  AddUserAffiliateFailed,
  AddUserAffiliate,
  AddUserAffiliateSuccess,
  GetUserAffiliate,
  GetUserAffiliateSuccess,
  GetUserAffiliateFailed,
  UpdateAffiliate,
  UpdateAffiliateSuccess,
  UpdateAffiliateFailed,
  CreateVoucherFailed,
  UpdateVoucherFailed,
  LoadVouchers,
  LoadVouchersPage,
  LoadVouchersSuccess,
  LoadVouchersFailed,
  CreateVoucher,
  CreateVoucherSuccess,
  UpdateVoucher,
  UpdateVoucherSuccess,
  UserActionType,
  GetVoucherPaymentMethod,
  GetVoucherPaymentMethodSuccess,
  GetVoucherPaymentMethodFailed,
  LoadCommissionsSuccess,
  LoadCommissionsFailed,
  LoadCommissionsPage,
  LoadCommissions,
  DownloadVoucherPdf,
  DownloadVoucherPdfSuccess,
  DownloadVoucherPdfFailed
} from './user.actions';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { switchMap, flatMap, catchError, map, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { getUserId } from '../../auth/+state/auth.selectors';
import { select, Store } from '@ngrx/store';
import { User } from '../../stores/stores';
import { Paging } from '../../api/types/Pageable';
import { getVouchersList } from './user.selectors';
import { UserService } from '../user.service';
import { getProfile } from '../../account/+state/account.selectors';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UserEffects {

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private store: Store<User>,
    private toastr: ToastrService,
    private router: Router,
    private translateSer: TranslateService) { }



  @Effect({ dispatch: false })
  onAddUserAffiliateFailed = this.actions$.pipe(
    ofType<AddUserAffiliateFailed>(UserActionType.AddUserAffiliateFailed),
    tap(a => this.toastr.error(a.error, 'An error occured!'))
  );

  @Effect()
  onAddUserAffiliate = this.actions$.pipe(
    ofType<AddUserAffiliate>(UserActionType.AddUserAffiliate),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) =>
      this.userService.addUserAffiliate(userId).pipe(
        flatMap(u => [new GetUserAffiliate(), new AddUserAffiliateSuccess()]),
        catchError(e => {
          if (e.status === 400) {
            return of(new AddUserAffiliateFailed(e.error.errors[0].message));
          }
          return of(new AddUserAffiliateFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect({ dispatch: false })
  onAddUserAffiliateSuccess = this.actions$.pipe(
    ofType<AddUserAffiliateSuccess>(UserActionType.AddUserAffiliateSuccess),
    withLatestFrom(this.store.pipe(select(getUserId))),
    tap(([a, userId]) => this.router.navigate(['/manager/user/partner']))
  );

  @Effect()
  onGetUserAffiliate = this.actions$.pipe(
    ofType<GetUserAffiliate>(UserActionType.GetUserAffiliate),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.userService.getUserAffiliate(userId)
      .pipe(
        map(u => new GetUserAffiliateSuccess(u)),
        catchError(a => of(new GetUserAffiliateFailed()))
      ))
  );

  @Effect()
  onUpdateAffiliate = this.actions$.pipe(
    ofType<UpdateAffiliate>(UserActionType.UpdateAffiliate),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.userService.updateAffiliate(userId, action.status,
      action.paymentDetails)
      .pipe(
        flatMap(u => [new UpdateAffiliateSuccess(), new GetUserAffiliate()]),
        catchError((e) => {
          if (e.status === 400) {
            return of(new UpdateAffiliateFailed(e.error.errors[0].message));
          }
          return of(new UpdateAffiliateFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect({ dispatch: false })
  onUserAffiliateSuccess = this.actions$.pipe(
    ofType<UpdateAffiliateSuccess>(UserActionType.UpdateAffiliateSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.upgradeAffiliateSuccess'), this.translateSer.instant('admin.alerts.headerSuccess')))
  );

  @Effect({ dispatch: false })
  onCreateVoucherFailed = this.actions$.pipe(
    ofType<UpdateAffiliateFailed | CreateVoucherFailed | UpdateVoucherFailed>(
      UserActionType.UpdateAffiliateFailed,
      UserActionType.CreateVoucherFailed,
      UserActionType.UpdateVoucherFailed
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  );

  @Effect()
  onLoadVouchers = this.actions$.pipe(
    ofType<LoadVouchers>(UserActionType.LoadVouchers),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.voucherList(userId, action.paging))
  );

  @Effect()
  onLoadVouchersPage = this.actions$.pipe(
    ofType<LoadVouchersPage>(UserActionType.LoadVouchersPage),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.voucherList(userId, action.paging))
  );

  @Effect()
  onLoadCommissions = this.actions$.pipe(
    ofType<LoadCommissions>(UserActionType.LoadCommissions),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.commissionList(userId, action.paging))
  );

  @Effect()
  onLoadCommissionsPage = this.actions$.pipe(
    ofType<LoadCommissionsPage>(UserActionType.LoadCommissionsPage),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.commissionList(userId, action.paging))
  );

  @Effect()
  onGetVoucherPaymentMethod = this.actions$.pipe(
    ofType<GetVoucherPaymentMethod>(UserActionType.GetVoucherPaymentMethod),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.userService.getVoucherPaymentMethod(userId, action.code)
      .pipe(map(s => new GetVoucherPaymentMethodSuccess(s)),
        catchError(a => of(new GetVoucherPaymentMethodFailed()))))
  );

  @Effect()
  onCreateVoucher = this.actions$.pipe(
    ofType<CreateVoucher>(UserActionType.CreateVoucher),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.userService.createVoucher(userId, action.storeVoucher)
      .pipe(
        flatMap(s => [new GetUserAffiliate(), new CreateVoucherSuccess()]),
        catchError((e) => {
          if (e.status === 400) {
            return of(new CreateVoucherFailed(e.error.errors[0].message));
          }
          return of(new CreateVoucherFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect()
  onUpdateVoucher = this.actions$.pipe(
    ofType<UpdateVoucher>(UserActionType.UpdateVoucher),
    withLatestFrom(this.store.pipe(select(getUserId))),
    switchMap(([action, userId]) => this.userService.updateVoucher(userId, action.voucherId, action.voucher)
      .pipe(
        flatMap(s => [new GetUserAffiliate(), new UpdateVoucherSuccess()]),
        catchError((e) => {
          if (e.status === 400) {
            return of(new UpdateVoucherFailed(e.error.errors[0].message));
          }
          return of(new UpdateVoucherFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect()
  onCreateVoucherSuccess = this.actions$.pipe(
    ofType<CreateVoucherSuccess | UpdateVoucherSuccess>(
      UserActionType.CreateVoucherSuccess,
      UserActionType.UpdateVoucherSuccess),
    withLatestFrom(this.store.pipe(select(getUserId)), this.store.pipe(select(getVouchersList))),
    flatMap(([action, userId, vouchers]) => [new LoadVouchers(vouchers.paging)])
  );

  @Effect()
  onDownloadVoucherPdf = this.actions$.pipe(
    ofType<DownloadVoucherPdf>(UserActionType.DownloadVoucherPdf),
    switchMap(action => this.userService.downloadVoucherPdf(action.userId, action.languageLocale, action.countryCode, action.voucherCode)
      .pipe(
        map(s => new DownloadVoucherPdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadVoucherPdfFailed('An error occured. Please try again')))
      ))
  );

  private voucherList(id: number, paging: Paging) {
    return this.userService.voucherList(id, paging).pipe(
      map(s => new LoadVouchersSuccess(s)),
      catchError(a => of(new LoadVouchersFailed()))
    );
  }

  private commissionList(id: number, paging: Paging) {
    return this.userService.commissionList(id, paging).pipe(
      map(s => new LoadCommissionsSuccess(s)),
      catchError(a => of(new LoadCommissionsFailed()))
    );
  }
}
