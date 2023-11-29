import { UserProfile } from '../../api/types/User';
import { Action } from '@ngrx/store';
import {UserAffiliate} from '../../api/types/UserAffiliate';
import {StoresActionType} from '../../stores/+state/stores.actions';
import {StoreVoucherRequest, Voucher, Commission} from '../../stores/stores';
import {PageableResults, Paging} from '../../api/types/Pageable';
import {VoucherPaymentMethod} from '../voucher';

export enum UserActionType {
    AddUserAffiliate = '[user] AddUserAffiliate',
    AddUserAffiliateSuccess = '[user] AddUserAffiliateSuccess',
    AddUserAffiliateFailed = '[user] AddUserAffiliateFailed',

    GetUserAffiliate = '[user] GetUserAffiliate',
    GetUserAffiliateFailed = '[user] GetUserAffiliateFailed',
    GetUserAffiliateSuccess = '[user] GetUserAffiliateSuccess',
    UpdateAffiliate = '[user] UpdateAffiliate',
    UpdateAffiliateSuccess = '[user] UpdateAffiliateSuccess',
    UpdateAffiliateFailed = '[user] UpdateAffiliateFailed',

    LoadVouchers = '[user] LoadVouchers',
    LoadVouchersPage = '[user] LoadVouchersPage',
    LoadVouchersSuccess = '[user] LoadVouchersSuccess',
    LoadVouchersFailed = '[user] LoadVouchersFailed',

    LoadCommissions = '[user] LoadCommissions',
    LoadCommissionsPage = '[user] LoadCommissionsPage',
    LoadCommissionsSuccess = '[user] LoadCommissionsSuccess',
    LoadCommissionsFailed = '[user] LoadCommissionsFailed',

    CreateVoucher = '[user] CreateVoucher',
    CreateVoucherSuccess = '[user] CreateVoucherSuccess',
    CreateVoucherFailed = '[user] CreateVoucherFailed',
    UpdateVoucher = '[user] UpdateVoucher',
    UpdateVoucherSuccess = '[user] UpdateVoucherSuccess',
    UpdateVoucherFailed = '[user] UpdateVoucherFailed',

    GetVoucherPaymentMethod = '[user] GetVoucherPaymentMethod',
    GetVoucherPaymentMethodSuccess = '[user] GetVoucherPaymentMethodSuccess',
    GetVoucherPaymentMethodFailed = '[user] GetVoucherPaymentMethodFailed',

    DownloadVoucherPdf = '[user] DownloadVoucherPdf',
    DownloadVoucherPdfSuccess = '[user] DownloadVoucherPdfSuccess',
    DownloadVoucherPdfFailed = '[user] DownloadVoucherPdfFailed'
}


export class AddUserAffiliate implements Action {
  readonly type = UserActionType.AddUserAffiliate;

  constructor() {}

}

export class AddUserAffiliateSuccess implements Action {
  readonly type = UserActionType.AddUserAffiliateSuccess;

  constructor() {}

}

export class AddUserAffiliateFailed implements Action {
  readonly type = UserActionType.AddUserAffiliateFailed;

  constructor(public readonly error: string) {}

}

export class GetUserAffiliate implements Action {
  readonly type = UserActionType.GetUserAffiliate;

  constructor() {}

}

export class GetUserAffiliateSuccess implements Action {
  readonly type = UserActionType.GetUserAffiliateSuccess;

  constructor(public readonly affiliate: UserAffiliate) {}

}

export class GetUserAffiliateFailed implements Action {
  readonly type = UserActionType.GetUserAffiliateFailed;

  constructor() {}

}

export class UpdateAffiliate implements Action {
  readonly type = UserActionType.UpdateAffiliate;

  constructor(public readonly status: string, public readonly paymentDetails: string) {}

}

export class UpdateAffiliateSuccess implements Action {
  readonly type = UserActionType.UpdateAffiliateSuccess;

  constructor() {}

}

export class UpdateAffiliateFailed implements Action {
  readonly type = UserActionType.UpdateAffiliateFailed;

  constructor(public readonly error: string) {}

}

// vouchers

export class LoadVouchers implements Action {
  readonly type = UserActionType.LoadVouchers;

  constructor(public readonly paging: Paging) {}

}

export class LoadVouchersPage implements Action {
  readonly type = UserActionType.LoadVouchersPage;

  constructor(public readonly paging: Paging) {}

}

export class LoadVouchersSuccess implements Action {
  readonly type = UserActionType.LoadVouchersSuccess;

  constructor(public readonly vouchers: PageableResults<Voucher>) {}

}

export class LoadVouchersFailed implements Action {
  readonly type = UserActionType.LoadVouchersFailed;

  constructor() {}

}

export class LoadCommissions implements Action {
  readonly type = UserActionType.LoadCommissions;

  constructor(public readonly paging: Paging) {}

}

export class LoadCommissionsPage implements Action {
  readonly type = UserActionType.LoadCommissionsPage;

  constructor(public readonly paging: Paging) {}

}

export class LoadCommissionsSuccess implements Action {
  readonly type = UserActionType.LoadCommissionsSuccess;

  constructor(public readonly vouchers: PageableResults<Commission>) {}

}

export class LoadCommissionsFailed implements Action {
  readonly type = UserActionType.LoadCommissionsFailed;

  constructor() {}

}

export class CreateVoucher implements Action {
  readonly type = UserActionType.CreateVoucher;

  constructor(public readonly storeVoucher: StoreVoucherRequest) {}

}

export class CreateVoucherSuccess implements Action {
  readonly type = UserActionType.CreateVoucherSuccess;

  constructor() {}

}

export class CreateVoucherFailed implements Action {
  readonly type = UserActionType.CreateVoucherFailed;

  constructor(public readonly error: string) {}

}

export class UpdateVoucher implements Action {
  readonly type = UserActionType.UpdateVoucher;

  constructor(public readonly voucherId: number, public readonly voucher: StoreVoucherRequest) {}

}

export class UpdateVoucherSuccess implements Action {
  readonly type = UserActionType.UpdateVoucherSuccess;

  constructor() {}

}

export class UpdateVoucherFailed implements Action {
  readonly type = UserActionType.UpdateVoucherFailed;

  constructor(public readonly error: string) {}

}

export class GetVoucherPaymentMethod implements Action {
  readonly type = UserActionType.GetVoucherPaymentMethod;

  constructor(public readonly code: string) {}

}

export class GetVoucherPaymentMethodSuccess implements Action {
  readonly type = UserActionType.GetVoucherPaymentMethodSuccess;

  constructor(public readonly paymentMethodComment: string) {}

}

export class GetVoucherPaymentMethodFailed implements Action {
  readonly type = UserActionType.GetVoucherPaymentMethodFailed;

  constructor() {}

}

export class DownloadVoucherPdf implements Action {
  readonly type = UserActionType.DownloadVoucherPdf;

  constructor(public readonly userId: number,
              public readonly languageLocale: string,
              public readonly countryCode: string,
              public readonly voucherCode: string) {}

}

export class DownloadVoucherPdfSuccess implements Action {
  readonly type = UserActionType.DownloadVoucherPdfSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) {}

}

export class DownloadVoucherPdfFailed implements Action {
  readonly type = UserActionType.DownloadVoucherPdfFailed;

  constructor(public readonly error: string) {}

}

// vouchers


export type UserAction =
    AddUserAffiliate
    | AddUserAffiliateSuccess
    | AddUserAffiliateFailed
    | GetUserAffiliate
    | GetUserAffiliateSuccess
    | GetUserAffiliateFailed
    | UpdateAffiliate
    | UpdateAffiliateSuccess
    | UpdateAffiliateFailed
    | LoadVouchers
    | LoadVouchersPage
    | LoadVouchersSuccess
    | LoadVouchersFailed
    | LoadCommissions
    | LoadCommissionsPage
    | LoadCommissionsSuccess
    | LoadCommissionsFailed
    | CreateVoucher
    | CreateVoucherFailed
    | CreateVoucherSuccess
    | UpdateVoucher
    | UpdateVoucherFailed
    | UpdateVoucherSuccess
    | GetVoucherPaymentMethod
    | GetVoucherPaymentMethodSuccess
    | GetVoucherPaymentMethodFailed;

