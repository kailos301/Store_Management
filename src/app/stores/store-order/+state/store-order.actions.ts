import { Action } from '@ngrx/store';
import { PageableResults, Paging } from 'src/app/api/types/Pageable';
import { BulkOrderUpdateRequest, ClientStoreOrder, ClientStoreOrderStatus } from '../store-order';
import { Order } from '../../stores';

import { TabSortFilterParams } from '../../+state/stores.reducer';

export enum StoreOrderActionType {
  Initialize = '[storeOrder] Initialize',
  LoadStoreOrdersSortFilter = '[storeOrder] LoadStoreOrdersSortFilter',
  LoadStoreOrdersSortFilterSuccess = '[storeOrder] LoadStoreOrdersSortFilterSuccess',
  LoadStoreOrdersSortFilterFail = '[storeOrder] LoadStoreOrdersSortFilterFail',
  UpdateOrderStatus = '[storeOrder] UpdateOrderStatus',
  UpdateOrderStatusSuccess = '[storeOrder] UpdateOrderStatusSuccess',
  UpdateOrderStatusFail = '[storeOrder] UpdateOrderStatusFail',
  UpdateBulkOrderStatus = '[storeOrder] UpdateBulkOrderStatus',
  UpdateBulkOrderStatusSuccess = '[storeOrder] UpdateBulkOrderStatusSuccess',
  UpdateBulkOrderStatusFail = '[storeOrder] UpdateBulkOrderStatusFail',
  LoadStoreOrder = '[storeOrder] LoadStoreOrder',
  LoadStoreOrderSuccess = '[storeOrder] LoadStoreOrderSuccess',
  LoadStoreOrderFail = '[storeOrder] LoadStoreOrderFail',
  DownloadOrderPdf = '[storeOrder] DownloadOrderPdf',
  DownloadOrderPdfSuccess = '[storeOrder] DownloadOrderPdfSuccess',
  DownloadOrderPdfFailed = '[storeOrder] DownloadOrderPdfFailed',
  DownloadAndPrintOrderPdf = '[storeOrder] DownloadAndPrintOrderPdf',
  DownloadAndPrintOrderPdfSuccess = '[storeOrder] DownloadAndPrintOrderPdfSuccess',
  DownloadAndPrintOrderPdfFailed = '[storeOrder] DownloadAndPrintOrderPdfFailed',
}

export class Initialize implements Action {
  readonly type = StoreOrderActionType.Initialize;

  constructor() {}

}


export class LoadStoreOrdersSortFilter implements Action {
  readonly type = StoreOrderActionType.LoadStoreOrdersSortFilter;

  constructor(public readonly storeId: number,
              public readonly tabName: string,
              public readonly tabSortFilterParams: TabSortFilterParams,
              public readonly paging?: Paging) {}

}

export class LoadStoreOrdersSortFilterSuccess implements Action {
  readonly type = StoreOrderActionType.LoadStoreOrdersSortFilterSuccess;

  constructor(public readonly orders: PageableResults<ClientStoreOrder>) {}

}

export class LoadStoreOrdersSortFilterFail implements Action {
  readonly type = StoreOrderActionType.LoadStoreOrdersSortFilterFail;

  constructor() {}

}

export class UpdateOrderStatus implements Action {
  readonly type = StoreOrderActionType.UpdateOrderStatus;

  constructor(public readonly orderUuid: string,
              public readonly status: ClientStoreOrderStatus,
              public readonly rejectReason: string,
              public readonly estimatedTime: Date,
              public readonly isReady: boolean) {}

}

export class UpdateOrderStatusSuccess implements Action {
  readonly type = StoreOrderActionType.UpdateOrderStatusSuccess;

  constructor(public readonly orderUuid: string) {}

}

export class UpdateOrderStatusFail implements Action {
  readonly type = StoreOrderActionType.UpdateOrderStatusFail;

  constructor(public readonly error: string) {}

}

export class UpdateBulkOrderStatus implements Action {
  readonly type = StoreOrderActionType.UpdateBulkOrderStatus;

  constructor(public readonly bulkOrderUpdateRequest: BulkOrderUpdateRequest) {}

}

export class UpdateBulkOrderStatusSuccess implements Action {
  readonly type = StoreOrderActionType.UpdateBulkOrderStatusSuccess;

  constructor() {}

}

export class UpdateBulkOrderStatusFail implements Action {
  readonly type = StoreOrderActionType.UpdateBulkOrderStatusFail;

  constructor(public readonly error: string) {}

}

export class LoadStoreOrder implements Action {
  readonly type = StoreOrderActionType.LoadStoreOrder;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}

}

export class LoadStoreOrderSuccess implements Action {
  readonly type = StoreOrderActionType.LoadStoreOrderSuccess;

  constructor(public readonly order: Order) {}

}

export class LoadStoreOrderFail implements Action {
  readonly type = StoreOrderActionType.LoadStoreOrderFail;

  constructor() {}

}

export class DownloadOrderPdf implements Action {
  readonly type = StoreOrderActionType.DownloadOrderPdf;

  constructor(public readonly storeId: number,
              public readonly orderId: string,
              public readonly uiLanguageLocale: string,
              public readonly catalogLanguageLocale: string) {}

}


export class DownloadOrderPdfSuccess implements Action {
  readonly type = StoreOrderActionType.DownloadOrderPdfSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) {}

}

export class DownloadOrderPdfFailed implements Action {
  readonly type = StoreOrderActionType.DownloadOrderPdfFailed;

  constructor(public readonly error: string) {}

}

export class DownloadAndPrintOrderPdf implements Action {
  readonly type = StoreOrderActionType.DownloadAndPrintOrderPdf;

  constructor(public readonly storeId: number,
              public readonly orderId: string,
              public readonly uiLanguageLocale: string,
              public readonly catalogLanguageLocale: string) {}
}

export class DownloadAndPrintOrderPdfSuccess implements Action {
  readonly type = StoreOrderActionType.DownloadAndPrintOrderPdfSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) {}

}

export class DownloadAndPrintOrderPdfFailed implements Action {
  readonly type = StoreOrderActionType.DownloadAndPrintOrderPdfFailed;

  constructor(public readonly error: string) {}

}


export type StoreOrderAction =
  Initialize
  | LoadStoreOrdersSortFilter
  | LoadStoreOrdersSortFilterSuccess
  | LoadStoreOrdersSortFilterFail
  | UpdateOrderStatus
  | UpdateOrderStatusSuccess
  | UpdateOrderStatusFail
  | UpdateBulkOrderStatus
  | UpdateBulkOrderStatusSuccess
  | UpdateBulkOrderStatusFail
  | LoadStoreOrder
  | LoadStoreOrderSuccess
  | LoadStoreOrderFail
  | DownloadOrderPdf
  | DownloadOrderPdfSuccess
  | DownloadOrderPdfFailed
  | DownloadAndPrintOrderPdf
  | DownloadAndPrintOrderPdfSuccess
  | DownloadAndPrintOrderPdfFailed
;
