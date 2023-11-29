import { Action } from '@ngrx/store';

export enum StorePaymentMethodsActionType {
  ToggleStripe = '[storesPaymentMethods] ToggleStripe',
  ToggleStripeSuccess = '[storesPaymentMethods] ToggleStripeSuccess',
  ToggleStripeFailed = '[storesPaymentMethods] ToggleStripeFailed',
  ConnectStripe = '[storesPaymentMethods] ConnectStripe',
  DisconnectStripe = '[storesPaymentMethods] DisconnectStripe',
  DisconnectStripeSuccess = '[storesPaymentMethods] DisconnectStripeSuccess',
  DisconnectStripeFailed = '[storesPaymentMethods] DisconnectStripeFailed',

  TogglePaypal = '[storesPaymentMethods] TogglePaypal',
  TogglePaypalSuccess = '[storesPaymentMethods] TogglePaypalSuccess',
  TogglePaypalFailed = '[storesPaymentMethods] TogglePaypalFailed',
  ConnectPaypal = '[storesPaymentMethods] ConnectPaypal',
  DisconnectPaypal = '[storesPaymentMethods] DisconnectPaypal',
  DisconnectPaypalSuccess = '[storesPaymentMethods] DisconnectPaypalSuccess',
  DisconnectPaypalFailed = '[storesPaymentMethods] DisconnectPaypalFailed',
  ToggleSquare = '[storesPaymentMethods] ToggleSquare',
  ToggleSquareSuccess = '[storesPaymentMethods] ToggleSquareSuccess',
  ToggleSquareFailed = '[storesPaymentMethods] ToggleSquareFailed',

  ConnectPaymentsense = '[storesPaymentMethods] ConnectPaymentsense',
  ConnectPaymentsenseSuccess = '[storesPaymentMethods] ConnectPaymentsenseSuccess',
  ConnectPaymentsenseFailed = '[storesPaymentMethods] ConnectPaymentsenseFailed',
  ConnectRMS = '[storesPaymentMethods] ConnectRMS',
  ConnectRMSSuccess = '[storesPaymentMethods] ConnectRMSSuccess',
  ConnectRMSFailed = '[storesPaymentMethods] ConnectRMSFailed',
  ConnectJCC = '[storesPaymentMethods] ConnectJCC',
  ConnectJCCSuccess = '[storesPaymentMethods] ConnectJCCSuccess',
  ConnectJCCFailed = '[storesPaymentMethods] ConnectJCCFailed'  ,
  DisConnectJCC = '[storesPaymentMethods] DisConnectJCC',
  DisConnectJCCSuccess = '[storesPaymentMethods] DisConnectJCCSuccess',
  DisConnectJCCFailed = '[storesPaymentMethods] DisConnectJCCFailed',
  ConnectTrustPayments = '[storesPaymentMethods] ConnectTrustPayments',
  ConnectTrustPaymentsSuccess = '[storesPaymentMethods] ConnectTrustPaymentsSuccess',
  ConnectTrustPaymentsFailed = '[storesPaymentMethods] ConnectTrustPaymentsFailed',
  DisconnectTrustPayments = '[storesPaymentMethods] DisconnectTrustPayments',
  DisconnectTrustPaymentsSuccess = '[storesPaymentMethods] DisconnectTrustPaymentsSuccess',
  DisconnectTrustPaymentsFailed = '[storesPaymentMethods] DisconnectTrustPaymentsFailed',
}

// Stripe integration
export class ToggleStripe implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleStripe;

  constructor(public readonly key: string, public readonly enabled: boolean) {}
}

export class ToggleStripeSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleStripeSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ToggleStripeFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleStripeFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectStripe implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectStripe;

  constructor() {}
}

export class DisconnectStripe implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectStripe;

  constructor() {}
}

export class DisconnectStripeSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectStripeSuccess;

  constructor() {}
}

export class DisconnectStripeFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectStripeFailed;

  constructor(public readonly errorMessages: string[]) {}
}

// Paypal integration
export class TogglePaypal implements Action {
  readonly type = StorePaymentMethodsActionType.TogglePaypal;

  constructor(public readonly enabled: boolean) {}
}

export class TogglePaypalSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.TogglePaypalSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class TogglePaypalFailed implements Action {
  readonly type = StorePaymentMethodsActionType.TogglePaypalFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectPaypal implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPaypal;

  constructor() {}
}

export class DisconnectPaypal implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectPaypal;

  constructor() {}
}

export class DisconnectPaypalSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectPaypalSuccess;

  constructor() {}
}

export class DisconnectPaypalFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectPaypalFailed;

  constructor(public readonly errorMessages: string[]) {}
}

// Suqare integration
export class ToggleSquare implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleSquare;

  constructor(public readonly enabled: boolean) {}
}

export class ToggleSquareSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleSquareSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ToggleSquareFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleSquareFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectPaymentsense implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPaymentsense;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectPaymentsenseSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPaymentsenseSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectPaymentsenseFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPaymentsenseFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectRMS implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectRMS;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectRMSSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectRMSSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectRMSFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectRMSFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectJCC implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectJCC;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectJCCSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectJCCSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectJCCFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectJCCFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisConnectJCC implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectJCC;

  constructor() {}
}

export class DisConnectJCCSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectJCCSuccess;

  constructor() {}
}

export class DisConnectJCCFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectJCCFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectTrustPayments implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectTrustPayments;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectTrustPaymentsSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectTrustPaymentsSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectTrustPaymentsFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectTrustPaymentsFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisconnectTrustPayments implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectTrustPayments;

  constructor() {}
}

export class DisconnectTrustPaymentsSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectTrustPaymentsSuccess;

  constructor() {}
}

export class DisconnectTrustPaymentsFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectTrustPaymentsFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export type StorePaymentMethodsAction =
  ToggleStripe
  | ToggleStripeFailed
  | ToggleStripeSuccess
  | ConnectStripe
  | DisconnectStripe
  | DisconnectStripeFailed
  | DisconnectStripeSuccess
  | TogglePaypal
  | TogglePaypalFailed
  | TogglePaypalSuccess
  | ConnectPaypal
  | DisconnectPaypal
  | DisconnectPaypalFailed
  | DisconnectPaypalSuccess
  | ToggleSquare
  | ToggleSquareFailed
  | ToggleSquareSuccess
  | ConnectPaymentsense
  | ConnectPaymentsenseSuccess
  | ConnectPaymentsenseFailed
  | ConnectRMS
  | ConnectRMSSuccess
  | ConnectRMSFailed
  | ConnectJCC
  | ConnectJCCSuccess
  | ConnectJCCFailed
  | DisConnectJCC
  | DisConnectJCCSuccess
  | DisConnectJCCFailed
  | ConnectTrustPayments
  | ConnectTrustPaymentsSuccess
  | ConnectTrustPaymentsFailed
  | DisconnectTrustPayments
  | DisconnectTrustPaymentsSuccess
  | DisconnectTrustPaymentsFailed
;
