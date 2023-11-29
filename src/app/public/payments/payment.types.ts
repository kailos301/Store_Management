export interface PaypalAccessToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

export interface PaypalOrderData {
  id: string;
  links: PaypalLink[];
  status: string;
}

export interface PaypalLink {
  href: string;
  rel: string;
  method: string;
  description?: string;
}

export interface StripeOrderData {
  connectedAccountId: string;
  publicKey: string;
  clientSecret: string;
}

export interface VivaToken {
  accessToken: string;
  expiresIn: number;
}

export interface PaymentsenseToken {
  id: string;
  expiresAt: number;
}

export interface RMSRequestJSON {
  CURRENCY: string;
  AUTO_SETTLE_FLAG: string;
  SHA1HASH: string;
  ORDER_ID: string;
  TIMESTAMP: string;
  HPP_ADDRESS_MATCH_INDICATOR: string;
  HPP_VERSION: string;
  MERCHANT_ID: string;
}
export interface RMSPaymentInfo {
  ACCOUNT: string;
  AMOUNT: string;
  AUTHCODE: string;
  AVSADDRESSRESULT: string;
  AVSPOSTCODERESULT: string;
  BATCHID: string;
  CARD_PAYMENT_BUTTON: string;
  CVNRESULT: string;
  HPP_FRAUDFILTER_RESULT: string;
  MERCHANT_ID: string;
  MESSAGE: string;
  ORDER_ID: string;
  PASREF: string;
  RESULT: string;
  SHA1HASH: string;
  TIMESTAMP: string;
}

export interface TrustPaymentsRequestJSON {
  currencyiso3a: string;
  orderId: string;
  sitereference: string;
  stprofile: string;
  version: string;
  mainamount: string;
  successfulurlredirect: string;
  declinedurlredirect: string;
  errorurlredirect: string;
}
export interface TrustPaymentsPaymentInfo {
  errorcode: string;
  orderreference: string;
  paymenttypedescription: string;
  requestreference: string;
  settlestatus: string;
  sitereference: string;
  transactionreference: string;
}

export interface PaymentSenseInfo {
  accessToken: string;
}

export interface StripePaymentInfo {
  paymentIntentId: string;
}

export interface JCCRequestJSON {
  version: string;
  merchantId: string;
  acquirerId: string;
  formattedPurchaseAmount: string;
  currency: string;
  currencyExponent: string;
  orderId: string;
  captureFlag: string;
  signature: string;
  signatureMethod: string;
}

export interface JCCPaymentInfo {
  AuthCode: string;
  OrderID: string;
  ReasonCode: string;
  ReferenceNo: string;
  ResponseCode: string;
  ResponseSignature: string;
}
