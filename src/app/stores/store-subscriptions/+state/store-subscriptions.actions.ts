import { StripeCheckoutSession, StorePurchase, StorePurchaceUpdateRequest, StorePurchaseStatus } from './../subscriptions';
import { Action } from '@ngrx/store';
import { ClientStore } from '../../stores';

export enum StoreSubscriptionsActionType {
  Initialize = '[storeSubscriptions] Initialize',
  PurchaseSubscription = '[storeSubscriptions] PurchaseSubscription',
  PurchaseSubscriptionSuccess = '[storeSubscriptions] PurchaseSubscriptionSuccess',
  PurchaseSubscriptionFail = '[storeSubscriptions] PurchaseSubscriptionFail',
  PurchaseSubscriptions = '[storeSubscriptions] PurchaseSubscriptions',
  PurchaseSubscriptionsSuccess = '[storeSubscriptions] PurchaseSubscriptionsSuccess',
  PurchaseSubscriptionsFail = '[storeSubscriptions] PurchaseSubscriptionsFail',
  UpdateSubscriptionPurchase = '[storeSubscriptions] UpdateSubscriptionPurchase',
  UpdateSubscriptionPurchaseSuccess = '[storeSubscriptions] UpdateSubscriptionPurchaseSuccess',
  UpdateSubscriptionPurchasesSuccess = '[storeSubscriptions] UpdateSubscriptionPurchasesSuccess',
  UpdateSubscriptionPurchaseFail = '[storeSubscriptions] UpdateSubscriptionPurchaseFail',
  CheckoutSubscription = '[storeSubscriptions] CheckoutSubscription',
  CheckoutSubscriptionIdeal = '[storeSubscriptions] CheckoutSubscriptionIdeal',
  CheckoutSubscriptionIdealSuccess = '[storeSubscriptions] CheckoutSubscriptionIdealSuccess',
  CheckoutSubscriptionIdealFail = '[storeSubscriptions] CheckoutSubscriptionIdealFail',
  CheckoutSubscriptionBancontact = '[storeSubscriptions] CheckoutSubscriptionBancontact',
  CheckoutSubscriptionBancontactSuccess = '[storeSubscriptions] CheckoutSubscriptionBancontactSuccess',
  CheckoutSubscriptionBancontactFail = '[storeSubscriptions] CheckoutSubscriptionBancontactFail',
  CheckoutSubscriptionStripe = '[storeSubscriptions] CheckoutSubscriptionStripe',
  CheckoutSubscriptionStripeSuccess = '[storeSubscriptions] CheckoutSubscriptionStripeSuccess',
  CheckoutSubscriptionStripeFail = '[storeSubscriptions] CheckoutSubscriptionStripeFail',
  CheckoutSubscriptionPaypal = '[storeSubscriptions] CheckoutSubscriptionPaypal',
  CheckoutSubscriptionPaypalSuccess = '[storeSubscriptions] CheckoutSubscriptionPaypalSuccess',
  CheckoutSubscriptionPaypalFail = '[storeSubscriptions] CheckoutSubscriptionPaypalFail',
  DownloadPurchaseInvoicePdf = '[storeSubscriptions] DownloadPurchaseInvoicePdf',
  DownloadPurchaseInvoicePdfSuccess = '[storeSubscriptions] DownloadPurchaseInvoicePdfSuccess',
  DownloadPurchaseInvoicePdfFailed = '[storeSubscriptions] DownloadPurchaseInvoicePdfFailed',
  ExtendSubscriptionPurchase = '[storeSubscriptions] ExtendSubscriptionPurchase',
  ExtendSubscriptionPurchaseSuccess = '[storeSubscriptions] ExtendSubscriptionPurchaseSuccess',
  ExtendSubscriptionPurchaseFailed = '[storeSubscriptions] ExtendSubscriptionPurchaseFailed',
  LoadInvoice = '[storeSubscriptions] LoadInvoice',
  LoadInvoiceSuccess = '[storeSubscriptions] LoadInvoiceSuccess',
  LoadInvoiceFail = '[storeSubscriptions] LoadInvoiceFail',
  SaveInvoice = '[storeSubscriptions] SaveInvoice',
  SaveInvoiceSuccess = '[storeSubscriptions] SaveInvoiceSuccess',
  SaveInvoiceFailed = '[storeSubscriptions] SaveInvoiceFailed',
  DeleteInvoice = '[storeSubscriptions] DeleteInvoice',
  DeleteInvoiceSuccess = '[storeSubscriptions] DeleteInvoiceSuccess',
  DeleteInvoiceFailed = '[storeSubscriptions] DeleteInvoiceFailed',
}

export class Initialize implements Action {
  readonly type = StoreSubscriptionsActionType.Initialize;

  constructor() { }

}

export class PurchaseSubscription implements Action {
  readonly type = StoreSubscriptionsActionType.PurchaseSubscription;

  constructor(public readonly storeId: number) { }

}

export class PurchaseSubscriptionSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.PurchaseSubscriptionSuccess;

  constructor(public readonly purchase: StorePurchase) { }

}

export class PurchaseSubscriptionFail implements Action {
  readonly type = StoreSubscriptionsActionType.PurchaseSubscriptionFail;

  constructor(public readonly errorMessages: string[]) { }

}

export class PurchaseSubscriptions implements Action {
  readonly type = StoreSubscriptionsActionType.PurchaseSubscriptions;

  constructor(public readonly storeId: number, public readonly status?: StorePurchaseStatus) { }

}

export class PurchaseSubscriptionsSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.PurchaseSubscriptionsSuccess;

  constructor(public readonly purchases: StorePurchase[]) { }

}

export class PurchaseSubscriptionsFail implements Action {
  readonly type = StoreSubscriptionsActionType.PurchaseSubscriptionsFail;

  constructor(public readonly errorMessages: string[]) { }

}

export class UpdateSubscriptionPurchase implements Action {
  readonly type = StoreSubscriptionsActionType.UpdateSubscriptionPurchase;

  constructor(public readonly updateRequest: StorePurchaceUpdateRequest) { }
}

export class UpdateSubscriptionPurchaseSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.UpdateSubscriptionPurchaseSuccess;

  constructor(public readonly purchase: StorePurchase) { }
}

export class UpdateSubscriptionPurchasesSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.UpdateSubscriptionPurchasesSuccess;

  constructor(public readonly purchase: StorePurchase[]) { }
}

export class UpdateSubscriptionPurchaseFail implements Action {
  readonly type = StoreSubscriptionsActionType.UpdateSubscriptionPurchaseFail;

  constructor(public readonly errorMessages: string[]) { }
}

export class CheckoutSubscription implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscription;

  constructor(public readonly provider: string) { }

}

export class CheckoutSubscriptionIdeal implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionIdeal;

  constructor() { }

}

export class CheckoutSubscriptionIdealSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionIdealSuccess;

  constructor(public readonly session: StripeCheckoutSession) { }

}

export class CheckoutSubscriptionIdealFail implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionIdealFail;

  constructor(public readonly errorMessages: string[]) { }

}

export class CheckoutSubscriptionBancontact implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionBancontact;

  constructor() { }

}

export class CheckoutSubscriptionBancontactSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionBancontactSuccess;

  constructor(public readonly session: StripeCheckoutSession) { }

}

export class CheckoutSubscriptionBancontactFail implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionBancontactFail;

  constructor(public readonly errorMessages: string[]) { }

}

export class CheckoutSubscriptionStripe implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionStripe;

  constructor() { }

}

export class CheckoutSubscriptionStripeSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionStripeSuccess;

  constructor(public readonly session: StripeCheckoutSession) { }

}

export class CheckoutSubscriptionStripeFail implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionStripeFail;

  constructor(public readonly errorMessages: string[]) { }

}

export class CheckoutSubscriptionPaypal implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionPaypal;

  constructor() { }

}

export class CheckoutSubscriptionPaypalSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionPaypalSuccess;

  constructor(public readonly approvalLink: string) { }

}

export class CheckoutSubscriptionPaypalFail implements Action {
  readonly type = StoreSubscriptionsActionType.CheckoutSubscriptionPaypalFail;

  constructor(public readonly errorMessages: string[]) { }

}

export class DownloadPurchaseInvoicePdf implements Action {
  readonly type = StoreSubscriptionsActionType.DownloadPurchaseInvoicePdf;

  constructor(public readonly storeId: number, public readonly purchaseId: number) { }
}

export class DownloadPurchaseInvoicePdfSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.DownloadPurchaseInvoicePdfSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }
}

export class DownloadPurchaseInvoicePdfFailed implements Action {
  readonly type = StoreSubscriptionsActionType.DownloadPurchaseInvoicePdfFailed;

  constructor(public readonly errorMessages: string) { }
}

export class ExtendSubscriptionPurchase implements Action {
  readonly type = StoreSubscriptionsActionType.ExtendSubscriptionPurchase;

  constructor(public readonly storeId: number, public readonly request: any) { }
}

export class ExtendSubscriptionPurchaseSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.ExtendSubscriptionPurchaseSuccess;

  constructor(public readonly store: ClientStore) { }
}

export class ExtendSubscriptionPurchaseFailed implements Action {
  readonly type = StoreSubscriptionsActionType.ExtendSubscriptionPurchaseFailed;

  constructor(public readonly errorMessages: string) { }
}

export class LoadInvoice implements Action {
  readonly type = StoreSubscriptionsActionType.LoadInvoice;

  constructor(public readonly storeId: number, public readonly invoiceId: number) { }

}

export class LoadInvoiceSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.LoadInvoiceSuccess;

  constructor(public readonly purchase: StorePurchase) { }

}

export class LoadInvoiceFail implements Action {
  readonly type = StoreSubscriptionsActionType.LoadInvoiceFail;

  constructor(public readonly errorMessages: string[]) { }

}

export class SaveInvoice implements Action {
  readonly type = StoreSubscriptionsActionType.SaveInvoice;

  constructor(public readonly invoiceId: number, public readonly request: any) { }
}

export class SaveInvoiceSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.SaveInvoiceSuccess;

  constructor(public readonly store: StorePurchase, public readonly storeId: number) { }
}

export class SaveInvoiceFailed implements Action {
  readonly type = StoreSubscriptionsActionType.SaveInvoiceFailed;

  constructor(public readonly errorMessages: string) { }
}

export class DeleteInvoice implements Action {
  readonly type = StoreSubscriptionsActionType.DeleteInvoice;

  constructor(public readonly invoiceId: number) { }
}

export class DeleteInvoiceSuccess implements Action {
  readonly type = StoreSubscriptionsActionType.DeleteInvoiceSuccess;

  constructor(public readonly storeId: number) { }
}

export class DeleteInvoiceFailed implements Action {
  readonly type = StoreSubscriptionsActionType.DeleteInvoiceFailed;

  constructor(public readonly errorMessages: string) { }
}
export type StoreSubscriptionsAction =
  Initialize
  | PurchaseSubscription
  | PurchaseSubscriptionSuccess
  | PurchaseSubscriptionFail
  | PurchaseSubscriptions
  | PurchaseSubscriptionsSuccess
  | PurchaseSubscriptionsFail
  | UpdateSubscriptionPurchase
  | UpdateSubscriptionPurchaseSuccess
  | UpdateSubscriptionPurchasesSuccess
  | UpdateSubscriptionPurchaseFail
  | CheckoutSubscription
  | CheckoutSubscriptionIdeal
  | CheckoutSubscriptionIdealSuccess
  | CheckoutSubscriptionIdealFail
  | CheckoutSubscriptionStripe
  | CheckoutSubscriptionStripeSuccess
  | CheckoutSubscriptionStripeFail
  | CheckoutSubscriptionPaypal
  | CheckoutSubscriptionPaypalSuccess
  | CheckoutSubscriptionPaypalFail
  | DownloadPurchaseInvoicePdf
  | DownloadPurchaseInvoicePdfSuccess
  | DownloadPurchaseInvoicePdfFailed
  | ExtendSubscriptionPurchase
  | ExtendSubscriptionPurchaseSuccess
  | ExtendSubscriptionPurchaseFailed
  | LoadInvoice
  | LoadInvoiceSuccess
  | LoadInvoiceFail
  | SaveInvoice
  | SaveInvoiceSuccess
  | SaveInvoiceFailed
  | DeleteInvoice
  | DeleteInvoiceSuccess
  | DeleteInvoiceFailed
  ;
