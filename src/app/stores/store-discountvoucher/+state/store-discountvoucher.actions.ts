import { Action } from '@ngrx/store';
import { PageableResults, Paging } from 'src/app/api/types/Pageable';
import { DiscountVoucherRequest, SaveDiscountVoucherView } from '../store-discountvoucher.helpers';


export enum StoresActionType {
    LoadDiscountVouchers = '[stores] LoadDiscountVouchers',
    LoadDiscountVouchersSuccess = '[stores] LoadDiscountVouchersSuccess',
    LoadDiscountVouchersFailed = '[stores] LoadDiscountVouchersFailed',
    LoadDiscountVoucher = '[stores] LoadDiscountVoucher',
    LoadDiscountVoucherSuccess = '[stores] LoadDiscountVoucherSuccess',
    LoadDiscountVoucherFailed = '[stores] LoadDiscountVoucherFailed',
    SaveDiscountVoucher = '[stores] SaveDiscountVoucher',
    SaveDiscountVoucherSuccess = '[stores] SaveDiscountVoucherSuccess',
    SaveDiscountVoucherFailed = '[stores] SaveDiscountVoucherFailed',
    DeleteDiscountVoucher = '[stores] DeleteDiscountVoucher',
    DeleteDiscountVoucherSuccess = '[stores] DeleteDiscountVoucherSuccess',
    DeleteDiscountVoucherFailed = '[stores] DeleteDiscountVoucherFailed',
}

export class LoadDiscountVouchers implements Action {
    readonly type = StoresActionType.LoadDiscountVouchers;
    constructor(public readonly storeId: number, public readonly paging) { }
}

export class LoadDiscountVouchersSuccess implements Action {
    readonly type = StoresActionType.LoadDiscountVouchersSuccess;
    constructor(public readonly discountVouchers: PageableResults<SaveDiscountVoucherView>) { }

}

export class LoadDiscountVouchersFailed implements Action {
    readonly type = StoresActionType.LoadDiscountVouchersFailed;
    constructor(public readonly error?: string[]) { }
}

export class LoadDiscountVoucher implements Action {
    readonly type = StoresActionType.LoadDiscountVoucher;
    constructor(public readonly storeId: number, public readonly discountVoucherId: number) { }
}

export class LoadDiscountVoucherSuccess implements Action {
    readonly type = StoresActionType.LoadDiscountVoucherSuccess;
    constructor(public readonly discountVoucher: SaveDiscountVoucherView) { }

}

export class LoadDiscountVoucherFailed implements Action {
    readonly type = StoresActionType.LoadDiscountVoucherFailed;
    constructor(public readonly error?: string[]) { }
}
export class SaveDiscountVoucher implements Action {
    readonly type = StoresActionType.SaveDiscountVoucher;
    constructor(public readonly storeId: number,
                public readonly discountVoucherId: number,
                public readonly request: DiscountVoucherRequest) { }
}

export class SaveDiscountVoucherSuccess implements Action {
    readonly type = StoresActionType.SaveDiscountVoucherSuccess;
    constructor(public readonly storeId: number,
                public readonly discountVoucherId: number,
                public readonly discountVoucher: SaveDiscountVoucherView) { }

}

export class SaveDiscountVoucherFailed implements Action {
    readonly type = StoresActionType.SaveDiscountVoucherFailed;
    constructor(public readonly error?: string[]) { }
}

export class DeleteDiscountVoucher implements Action {
    readonly type = StoresActionType.DeleteDiscountVoucher;

    constructor(public readonly storeId: number, public readonly discountVoucherId: number) { }
}

export class DeleteDiscountVoucherSuccess implements Action {
    readonly type = StoresActionType.DeleteDiscountVoucherSuccess;

    constructor(public readonly storeId: number) { }
}

export class DeleteDiscountVoucherFailed implements Action {
    readonly type = StoresActionType.DeleteDiscountVoucherFailed;

    constructor(public readonly error?: string[]) { }
}


export type StoresAction =
    LoadDiscountVoucher
    | LoadDiscountVoucherSuccess
    | LoadDiscountVoucherFailed
    | LoadDiscountVouchers
    | LoadDiscountVouchersSuccess
    | LoadDiscountVouchersFailed
    | SaveDiscountVoucher
    | SaveDiscountVoucherSuccess
    | SaveDiscountVoucherFailed
    | DeleteDiscountVoucher
    | DeleteDiscountVoucherSuccess
    | DeleteDiscountVoucherFailed;

