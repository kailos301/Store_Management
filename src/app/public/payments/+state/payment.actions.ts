import { Action } from '@ngrx/store';
import {
  PaypalAccessToken,
  StripeOrderData,
  VivaToken,
  PaymentsenseToken,
  RMSRequestJSON,
  RMSPaymentInfo,
  TrustPaymentsRequestJSON,
  TrustPaymentsPaymentInfo,
  JCCRequestJSON,
  JCCPaymentInfo
} from '../payment.types';

export enum PaymentActionType {
  ObtainToken = '[paypal] ObtainToken',
  ObtainTokenSuccess = '[paypal] ObtainTokenSuccess',
  ObtainTokenFailed = '[paypal] ObtainTokenFailed',
  CreatePaypalOrder = '[paypal] CreatePaypalOrder',
  CreatePaypalOrderSuccess = '[paypal] ObtainPartnerLinksSuccess',
  CreatePaypalOrderFailed = '[paypal] ObtainPartnerLinksFailed',
  // STRIPE
  CreateStripePaymentIntent = '[stripe] CreateStripePaymentIntent',
  CreateStripePaymentIntentSuccess = '[stripe] CreateStripePaymentIntentSuccess',
  CreateStripePaymentIntentFailed = '[stripe] CreateStripePaymentIntentFailed',
  ClearStripePaymentIntent = '[stripe] ClearStripePaymentIntent',
  CompleteStripePayment = '[stripe] CompleteStripePayment',
  // iDeal
  CreateIdealPaymentIntent = '[ideal] CreateIdealPaymentIntent',
  CreateIdealPaymentIntentSuccess = '[ideal] CreateIdealPaymentIntentSuccess',
  CreateIdealPaymentIntentFailed = '[ideal] CreateIdealPaymentIntentFailed',
  ClearIdealPaymentIntent = '[ideal] ClearIdealPaymentIntent',
  // Bancontact
  CreateBancontactPaymentIntent = '[Bancontact] CreateBancontactPaymentIntent',
  CreateBancontactPaymentIntentSuccess = '[Bancontact] CreateBancontactPaymentIntentSuccess',
  CreateBancontactPaymentIntentFailed = '[Bancontact] CreateBancontactPaymentIntentFailed',
  ClearBancontactPaymentIntent = '[Bancontact] ClearBancontactPaymentIntent',
  // Square
  CheckoutSquare = '[Square] CheckoutSquare',
  // VIVA
  CreateVivaPaymentToken = '[Viva] CreateVivaPaymentToken',
  CreateVivaPaymentTokenSuccess = '[Viva] CreateVivaPaymentTokenSuccess',
  CreateVivaPaymentTokenFailed = '[Viva] CreateVivaPaymentTokenFailed',
  ChargeVivaPayment = '[Viva] ChargeVivaPayment',
  ChargeVivaPaymentSuccess = '[Viva] ChargeVivaPaymentSuccess',
  ChargeVivaPaymentFailed = '[Viva] ChargeVivaPaymentFailed',
  ClearVivaPayment = '[Viva] ClearVivaPayment',
  // Digital Wallets
  CreateStripeDigitalWalletPaymentIntent = '[stripe] CreateStripeDigitalWalletPaymentIntent',
  CreateStripeDigitalWalletPaymentIntentSuccess = '[stripe] CreateStripeDigitalWalletPaymentIntentSuccess',
  CreateStripeDigitalWalletPaymentIntentFailed = '[stripe] CreateStripeDigitalWalletPaymentIntentFailed',
  ClearStripeDigitalWalletPaymentIntent = '[stripe] ClearStripeDigitalWalletPaymentIntent',
  // Paymentsense
  CreatePaymentsenseToken = '[Paymentsense] CreatePaymentsenseToken',
  CreatePaymentsenseTokenSuccess = '[Paymentsense] CreatePaymentsenseTokenSuccess',
  CreatePaymentsenseTokenFailed = '[Paymentsense] CreatePaymentsenseTokenFailed',
  CompletePaymentsensePayment = '[Paymentsense] CompletePaymentsensePayment',
  CompletePaymentsensePaymentSuccess = '[Paymentsense] CompletePaymentsensePaymentSuccess',
  CompletePaymentsensePaymentFailed = '[Paymentsense] CompletePaymentsensePaymentFailed',
  ClearPaymentsense = '[Paymentsense] ClearPaymentsense',
  // RMS
  CreateRMSRequestJSON = '[RMS] CreateRMSRequestJSON',
  CreateRMSRequestJSONSuccess = '[RMS] CreateRMSRequestJSONSuccess',
  CreateRMSRequestJSONFailed = '[RMS] CreateRMSRequestJSONFailed',
  CompleteRMSPayment = '[RMS] CompleteRMSPayment',
  CompleteRMSPaymentSuccess = '[RMS] CompleteRMSPaymentSuccess',
  CompleteRMSPaymentFailed = '[RMS] CompleteRMSPaymentFailed',
  ClearRMSPayment = '[RMS] ClearRMSPayment',
  // TrustPayments
  CreateTrustPaymentsRequestJSON = '[TrustPayments] CreateTrustPaymentsRequestJSON',
  CreateTrustPaymentsRequestJSONSuccess = '[TrustPayments] CreateTrustPaymentsRequestJSONSuccess',
  CreateTrustPaymentsRequestJSONFailed = '[TrustPayments] CreateTrustPaymentsRequestJSONFailed',
  CompleteTrustPaymentsPayment = '[TrustPayments] CompleteTrustPaymentsPayment',
  CompleteTrustPaymentsPaymentSuccess = '[TrustPayments] CompleteTrustPaymentsPaymentSuccess',
  CompleteTrustPaymentsPaymentFailed = '[TrustPayments] CompleteTrustPaymentsPaymentFailed',
  ClearTrustPaymentsPayment = '[TrustPayments] ClearTrustPaymentsPayment',
  // JCC
  CreateJCCRequestJSON = '[JCC] CreateJCCRequestJSON',
  CreateJCCRequestJSONSuccess = '[JCC] CreateJCCRequestJSONSuccess',
  CreateJCCRequestJSONFailed = '[JCC] CreateJCCRequestJSONFailed',
  CompleteJCCPayment = '[JCC] CompleteJCCPayment',
  CompleteJCCPaymentSuccess = '[JCC] CompleteJCCPaymentSuccess',
  CompleteJCCPaymentFailed = '[JCC] CompleteJCCPaymentFailed',
  ClearJCCPayment = '[JCC] ClearJCCPayment',
}

export class ObtainToken implements Action {
  readonly type = PaymentActionType.ObtainToken;

  constructor() {}
}

export class ObtainTokenSuccess implements Action {
  readonly type = PaymentActionType.ObtainTokenSuccess;

  constructor(public readonly tokenData: PaypalAccessToken) {}

}

export class ObtainTokenFailed implements Action {
  readonly type = PaymentActionType.ObtainTokenFailed;

  constructor() {}

}


export class CreatePaypalOrder implements Action {
  readonly type = PaymentActionType.CreatePaypalOrder;

  constructor(public readonly paypalConfigObject: {}, public readonly accessToken: string) {}
}

export class CreatePaypalOrderSuccess implements Action {
  readonly type = PaymentActionType.CreatePaypalOrderSuccess;

  constructor(public readonly linksData: any) {}

}

export class CreatePaypalOrderFailed implements Action {
  readonly type = PaymentActionType.CreatePaypalOrderFailed;

  constructor() {}

}

// STRIPE

export class CreateStripePaymentIntent implements Action {
  readonly type = PaymentActionType.CreateStripePaymentIntent;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateStripePaymentIntentSuccess implements Action {
  readonly type = PaymentActionType.CreateStripePaymentIntentSuccess;

  constructor(public readonly paymentIntent: StripeOrderData) {}

}

export class CreateStripePaymentIntentFailed implements Action {
  readonly type = PaymentActionType.CreateStripePaymentIntentFailed;

  constructor() {}

}

export class CompleteStripePayment implements Action {
  readonly type = PaymentActionType.CompleteStripePayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly paymentIntentId: string) {}
}

export class ClearStripePaymentIntent implements Action {
  readonly type = PaymentActionType.ClearStripePaymentIntent;

  constructor() {}
}

// iDEAL

export class CreateIdealPaymentIntent implements Action {
  readonly type = PaymentActionType.CreateIdealPaymentIntent;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateIdealPaymentIntentSuccess implements Action {
  readonly type = PaymentActionType.CreateIdealPaymentIntentSuccess;

  constructor(public readonly paymentIntent: StripeOrderData) {}

}

export class CreateIdealPaymentIntentFailed implements Action {
  readonly type = PaymentActionType.CreateIdealPaymentIntentFailed;

  constructor() {}

}

export class ClearIdealPaymentIntent implements Action {
  readonly type = PaymentActionType.ClearIdealPaymentIntent;

  constructor() {}
}

// Bancontact

export class CreateBancontactPaymentIntent implements Action {
  readonly type = PaymentActionType.CreateBancontactPaymentIntent;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateBancontactPaymentIntentSuccess implements Action {
  readonly type = PaymentActionType.CreateBancontactPaymentIntentSuccess;

  constructor(public readonly paymentIntent: StripeOrderData) {}

}

export class CreateBancontactPaymentIntentFailed implements Action {
  readonly type = PaymentActionType.CreateBancontactPaymentIntentFailed;

  constructor() {}

}

export class ClearBancontactPaymentIntent implements Action {
  readonly type = PaymentActionType.ClearBancontactPaymentIntent;

  constructor() {}
}

export class CheckoutSquare implements Action {
  readonly type = PaymentActionType.CheckoutSquare;

  constructor(
    public readonly storeId: number,
    public readonly orderUuid: string,
    public readonly nonce: string,
    public readonly verificationToken: string,
  ) {}
}

// Viva

export class CreateVivaPaymentToken implements Action {
  readonly type = PaymentActionType.CreateVivaPaymentToken;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateVivaPaymentTokenSuccess implements Action {
  readonly type = PaymentActionType.CreateVivaPaymentTokenSuccess;

  constructor(public readonly token: VivaToken) {}
}

export class CreateVivaPaymentTokenFailed implements Action {
  readonly type = PaymentActionType.CreateVivaPaymentTokenFailed;

  constructor() {}
}

export class ChargeVivaPayment implements Action {
  readonly type = PaymentActionType.ChargeVivaPayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly chargeToken: string) {}
}

export class ChargeVivaPaymentSuccess implements Action {
  readonly type = PaymentActionType.ChargeVivaPaymentSuccess;

  constructor() {}
}

export class ChargeVivaPaymentFailed implements Action {
  readonly type = PaymentActionType.ChargeVivaPaymentFailed;

  constructor() {}
}

export class ClearVivaPayment implements Action {
  readonly type = PaymentActionType.ClearVivaPayment;

  constructor() {}
}

// Digital Wallets

export class CreateStripeDigitalWalletPaymentIntent implements Action {
  readonly type = PaymentActionType.CreateStripeDigitalWalletPaymentIntent;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateStripeDigitalWalletPaymentIntentSuccess implements Action {
  readonly type = PaymentActionType.CreateStripeDigitalWalletPaymentIntentSuccess;

  constructor(public readonly paymentIntent: StripeOrderData) {}

}

export class CreateStripeDigitalWalletPaymentIntentFailed implements Action {
  readonly type = PaymentActionType.CreateStripeDigitalWalletPaymentIntentFailed;

  constructor() {}

}

export class ClearStripeDigitalWalletPaymentIntent implements Action {
  readonly type = PaymentActionType.ClearStripeDigitalWalletPaymentIntent;

  constructor() {}
}


// Paymentsense

export class CreatePaymentsenseToken implements Action {
  readonly type = PaymentActionType.CreatePaymentsenseToken;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreatePaymentsenseTokenSuccess implements Action {
  readonly type = PaymentActionType.CreatePaymentsenseTokenSuccess;

  constructor(public readonly token: PaymentsenseToken) {}
}

export class CreatePaymentsenseTokenFailed implements Action {
  readonly type = PaymentActionType.CreatePaymentsenseTokenFailed;

  constructor() {}
}

export class ClearPaymentsense implements Action {
  readonly type = PaymentActionType.ClearPaymentsense;

  constructor() {}
}

export class CompletePaymentsensePayment implements Action {
  readonly type = PaymentActionType.CompletePaymentsensePayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly chargeToken: string) {}
}

export class CompletePaymentsensePaymentSuccess implements Action {
  readonly type = PaymentActionType.CompletePaymentsensePaymentSuccess;

  constructor() {}
}

export class CompletePaymentsensePaymentFailed implements Action {
  readonly type = PaymentActionType.CompletePaymentsensePaymentFailed;

  constructor() {}
}


// RMS

export class CreateRMSRequestJSON implements Action {
  readonly type = PaymentActionType.CreateRMSRequestJSON;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateRMSRequestJSONSuccess implements Action {
  readonly type = PaymentActionType.CreateRMSRequestJSONSuccess;

  constructor(public readonly token: RMSRequestJSON) {}
}

export class CreateRMSRequestJSONFailed implements Action {
  readonly type = PaymentActionType.CreateRMSRequestJSONFailed;

  constructor() {}
}

export class ClearRMSPayment implements Action {
  readonly type = PaymentActionType.ClearRMSPayment;

  constructor() {}
}

export class CompleteRMSPayment implements Action {
  readonly type = PaymentActionType.CompleteRMSPayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly paymentInfo: RMSPaymentInfo) {}
}

export class CompleteRMSPaymentSuccess implements Action {
  readonly type = PaymentActionType.CompleteRMSPaymentSuccess;

  constructor() {}
}

export class CompleteRMSPaymentFailed implements Action {
  readonly type = PaymentActionType.CompleteRMSPaymentFailed;

  constructor() {}
}


// TrustPayments

export class CreateTrustPaymentsRequestJSON implements Action {
  readonly type = PaymentActionType.CreateTrustPaymentsRequestJSON;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateTrustPaymentsRequestJSONSuccess implements Action {
  readonly type = PaymentActionType.CreateTrustPaymentsRequestJSONSuccess;

  constructor(public readonly token: TrustPaymentsRequestJSON) {}
}

export class CreateTrustPaymentsRequestJSONFailed implements Action {
  readonly type = PaymentActionType.CreateTrustPaymentsRequestJSONFailed;

  constructor() {}
}

export class ClearTrustPaymentsPayment implements Action {
  readonly type = PaymentActionType.ClearTrustPaymentsPayment;

  constructor() {}
}

export class CompleteTrustPaymentsPayment implements Action {
  readonly type = PaymentActionType.CompleteTrustPaymentsPayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly paymentInfo: TrustPaymentsPaymentInfo) {}
}

export class CompleteTrustPaymentsPaymentSuccess implements Action {
  readonly type = PaymentActionType.CompleteTrustPaymentsPaymentSuccess;

  constructor() {}
}

export class CompleteTrustPaymentsPaymentFailed implements Action {
  readonly type = PaymentActionType.CompleteTrustPaymentsPaymentFailed;

  constructor() {}
}

export class CreateJCCRequestJSON implements Action {
  readonly type = PaymentActionType.CreateJCCRequestJSON;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateJCCRequestJSONSuccess implements Action {
  readonly type = PaymentActionType.CreateJCCRequestJSONSuccess;

  constructor(public readonly token: JCCRequestJSON) {}
}

export class CreateJCCRequestJSONFailed implements Action {
  readonly type = PaymentActionType.CreateJCCRequestJSONFailed;

  constructor() {}
}

export class ClearJCCPayment implements Action {
  readonly type = PaymentActionType.ClearJCCPayment;

  constructor() {}
}

export class CompleteJCCPayment implements Action {
  readonly type = PaymentActionType.CompleteJCCPayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly paymentInfo: JCCPaymentInfo) {}
}

export class CompleteJCCPaymentSuccess implements Action {
  readonly type = PaymentActionType.CompleteJCCPaymentSuccess;

  constructor() {}
}

export class CompleteJCCPaymentFailed implements Action {
  readonly type = PaymentActionType.CompleteJCCPaymentFailed;

  constructor() {}
}

export type PaymentStoresAction =
  ObtainToken
  | ObtainTokenSuccess
  | ObtainTokenFailed
  | CreatePaypalOrder
  | CreatePaypalOrderSuccess
  | CreatePaypalOrderFailed
  // STRIPE
  | CreateStripePaymentIntent
  | CreateStripePaymentIntentSuccess
  | CreateStripePaymentIntentFailed
  | ClearStripePaymentIntent
  | CompleteStripePayment
  // iDeal
  | CreateIdealPaymentIntent
  | CreateIdealPaymentIntentSuccess
  | CreateIdealPaymentIntentFailed
  | ClearIdealPaymentIntent
  // Bancontact
  | CreateBancontactPaymentIntent
  | CreateBancontactPaymentIntentSuccess
  | CreateBancontactPaymentIntentFailed
  | ClearBancontactPaymentIntent
  // Square
  | CheckoutSquare
  // Viva
  | CreateVivaPaymentToken
  | CreateVivaPaymentTokenSuccess
  | CreateVivaPaymentTokenFailed
  | ChargeVivaPayment
  | ChargeVivaPaymentSuccess
  | ChargeVivaPaymentFailed
  | ClearVivaPayment
  // Digital Wallets
  | CreateStripeDigitalWalletPaymentIntent
  | CreateStripeDigitalWalletPaymentIntentSuccess
  | CreateStripeDigitalWalletPaymentIntentFailed
  | ClearStripeDigitalWalletPaymentIntent
  // Paymentsense
  | CreatePaymentsenseToken
  | CreatePaymentsenseTokenSuccess
  | CreatePaymentsenseTokenFailed
  | ClearPaymentsense
  | CompletePaymentsensePayment
  | CompletePaymentsensePaymentSuccess
  | CompletePaymentsensePaymentFailed
  // RMS
  | CreateRMSRequestJSON
  | CreateRMSRequestJSONSuccess
  | CreateRMSRequestJSONFailed
  | ClearRMSPayment
  | CompleteRMSPayment
  | CompleteRMSPaymentSuccess
  | CompleteRMSPaymentFailed
  // TrustPayments
  | CreateTrustPaymentsRequestJSON
  | CreateTrustPaymentsRequestJSONSuccess
  | CreateTrustPaymentsRequestJSONFailed
  | ClearTrustPaymentsPayment
  | CompleteTrustPaymentsPayment
  | CompleteTrustPaymentsPaymentSuccess
  | CompleteTrustPaymentsPaymentFailed
  // JCC
  | CreateJCCRequestJSON
  | CreateJCCRequestJSONSuccess
  | CreateJCCRequestJSONFailed
  | ClearJCCPayment
  | CompleteJCCPayment
  | CompleteJCCPaymentSuccess
  | CompleteJCCPaymentFailed
  ;
