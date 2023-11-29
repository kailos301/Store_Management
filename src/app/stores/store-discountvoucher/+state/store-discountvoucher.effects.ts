import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SaveDiscountVoucherView } from '../store-discountvoucher.helpers';
import { StoreDiscountvoucherService } from '../store-discountvoucher.service';
import {
    DeleteDiscountVoucher,
    DeleteDiscountVoucherFailed,
    DeleteDiscountVoucherSuccess,
    LoadDiscountVoucher,
    LoadDiscountVoucherFailed,
    LoadDiscountVouchers,
    LoadDiscountVouchersFailed,
    LoadDiscountVouchersSuccess,
    LoadDiscountVoucherSuccess,
    SaveDiscountVoucher,
    SaveDiscountVoucherFailed,
    SaveDiscountVoucherSuccess,
    StoresActionType
} from './store-discountvoucher.actions';

@Injectable()
export class StoresEffects {

    constructor(
        private actions$: Actions,
        private discountVoucherService: StoreDiscountvoucherService,
        private toastr: ToastrService,
        private router: Router,
        private translateSer: TranslateService
    ) { }
    @Effect()
    onLoadDiscountVoucher = this.actions$.pipe(
        ofType<LoadDiscountVoucher>(StoresActionType.LoadDiscountVoucher),
        switchMap((action) => this.discountVoucherService.loadDiscountVoucher(action.storeId, action.discountVoucherId)
            .pipe(
                map((u: SaveDiscountVoucherView) => new LoadDiscountVoucherSuccess(u)),
                catchError(a => of(new LoadDiscountVoucherFailed(a.error.errors.map(err => err.message))))
            ))
    );

    @Effect()
    onLoadDiscountVouchers = this.actions$.pipe(
        ofType<LoadDiscountVouchers>(StoresActionType.LoadDiscountVouchers),
        switchMap((action) => this.discountVoucherService.loadDiscountVouchers(action.storeId, action.paging)
            .pipe(
                map((u) => new LoadDiscountVouchersSuccess(u)),
                catchError(a => of(new LoadDiscountVouchersFailed(a.error.errors.map(err => err.message))))
            ))
    );

    @Effect()
    onSaveDiscountVoucher = this.actions$.pipe(
        ofType<SaveDiscountVoucher>(StoresActionType.SaveDiscountVoucher),
        switchMap(action => this.discountVoucherService.saveDiscountVoucher(action.storeId, action.discountVoucherId, action.request)
            .pipe(
                map(s => new SaveDiscountVoucherSuccess(action.storeId, action.discountVoucherId, s)),
                catchError(a => of(new SaveDiscountVoucherFailed(a.error.errors.map(err => err.message))))
            ))
    );

    @Effect({ dispatch: false })
    onSaveDiscountVoucherSuccess = this.actions$.pipe(
        ofType<SaveDiscountVoucherSuccess>(StoresActionType.SaveDiscountVoucherSuccess),
        tap(z => {
            this.toastr.success(this.translateSer.instant('admin.store.message.saveDiscountVoucherSuccess'));
            this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'discount-voucher']);
        })
    );

    @Effect()
    onDeleteDiscountVoucher = this.actions$.pipe(
        ofType<DeleteDiscountVoucher>(StoresActionType.DeleteDiscountVoucher),
        switchMap(a => this.discountVoucherService.deleteDiscountVoucher(a.storeId, a.discountVoucherId)
            .pipe(
                map(r => new DeleteDiscountVoucherSuccess(a.storeId)),
                catchError(e => of(new DeleteDiscountVoucherFailed(e.error.errors.map(err => err.message))))
            )
        )
    );

    @Effect({ dispatch: false })
    onDeleteDiscountVoucherSuccess = this.actions$.pipe(
        ofType<DeleteDiscountVoucherSuccess>(StoresActionType.DeleteDiscountVoucherSuccess),
        tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.deleteDiscountVoucherSuccess'))),
        tap(z => {
            this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'discount-voucher']);
        })
    );

    @Effect({ dispatch: false })
    onStoreDiscountVoucherActionFailed = this.actions$.pipe(
      ofType<LoadDiscountVouchersFailed | LoadDiscountVoucherFailed | SaveDiscountVoucherFailed| DeleteDiscountVoucherFailed>(
        StoresActionType.LoadDiscountVouchersFailed,
        StoresActionType.LoadDiscountVoucherFailed,
        StoresActionType.SaveDiscountVoucherFailed,
        StoresActionType.DeleteDiscountVoucherFailed
      ),
      tap(a => a.error.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail'))))
    );
}
