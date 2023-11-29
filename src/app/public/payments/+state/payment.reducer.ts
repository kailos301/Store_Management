import { PaymentStoresAction, PaymentActionType } from './payment.actions';
import { combineReducers } from '@ngrx/store';
import {
  PaypalAccessToken,
  PaypalOrderData,
  StripeOrderData,
  VivaToken,
  PaymentsenseToken,
  RMSRequestJSON,
  TrustPaymentsRequestJSON,
  JCCRequestJSON
} from '../payment.types';
import { StoreAction, StoreActionType } from '../../store/+state/stores.actions';

/**
 * PAYPAL STATE MANAGEMENT
 */
export interface Paypal {
  paypalState: PaypalState;
}

export interface PaypalState {
  status:
    'OBTAINING_TOKEN'
  | 'TOKEN_OBTAINED'
  | 'TOKEN_FAILED'
  | 'CREATING_PAYPAL_ORDER'
  | 'PAYPAL_ORDER_CREATED'
  | 'PAYPAL_ORDER_FAILED';
  accessTokenData: PaypalAccessToken;
  paypalOrderData: PaypalOrderData; // for now the type is any, TODO add paypalOrderData type
}

export const paypalInitialState: Paypal = {
  paypalState: {
    status: 'OBTAINING_TOKEN',
    accessTokenData: null,
    paypalOrderData: null
  }
};

export function paypalState(
  state: PaypalState = paypalInitialState.paypalState,
  action: PaymentStoresAction): PaypalState {
  switch (action.type) {
    case PaymentActionType.ObtainToken:
      return paypalInitialState.paypalState;
    case PaymentActionType.ObtainTokenSuccess:
      return {
        ...state,
        status: 'TOKEN_OBTAINED',
        accessTokenData: action.tokenData
      };
    case PaymentActionType.ObtainTokenFailed:
      return {
        ...state,
        status: 'TOKEN_FAILED',
      };
    case PaymentActionType.CreatePaypalOrder:
      return {
        ...state,
        status: 'CREATING_PAYPAL_ORDER',
      };
    case PaymentActionType.CreatePaypalOrderSuccess:
      return {
        ...state,
        status: 'PAYPAL_ORDER_CREATED',
        paypalOrderData: action.linksData
      };
    case PaymentActionType.CreatePaypalOrderFailed:
      return {
        ...state,
        status: 'PAYPAL_ORDER_FAILED',
      };
  }
  return state;
}


const reducerPaypalState: (state: Paypal, action: PaymentStoresAction) => Paypal = combineReducers({
  paypalState
});

export function paypalStateReducer(state: Paypal = paypalInitialState, action: PaymentStoresAction): Paypal {
    return reducerPaypalState(state, action);
}

// EOF: paypal state management


/**
 * STRIPE STATE MANAGEMENT
 */
export interface Stripe {
  stripeState: StripeState;
}

export interface StripeState {
  status:
    'INITIAL'
  | 'INITIATING_PAYMENT_INTENT'
  | 'PAYMENT_INTENT_CREATED'
  | 'PAYMENT_INTENT_FAILED'
  ;
  stripePaymentIntent: StripeOrderData;
}

export const stripeInitialState: Stripe = {
  stripeState: {
    status: 'INITIAL',
    stripePaymentIntent: null
  }
};

export function stripeState(
  state: StripeState = stripeInitialState.stripeState,
  action: PaymentStoresAction): StripeState {
  switch (action.type) {
    case PaymentActionType.CreateStripePaymentIntent:
      return {
        ...state,
        status: 'INITIATING_PAYMENT_INTENT'
      };
    case PaymentActionType.CreateStripePaymentIntentSuccess:
      return {
        ...state,
        status: 'PAYMENT_INTENT_CREATED',
        stripePaymentIntent: action.paymentIntent
      };
    case PaymentActionType.CreateStripePaymentIntentFailed:
      return {
        ...state,
        status: 'PAYMENT_INTENT_FAILED',
      };
    case PaymentActionType.ClearStripePaymentIntent:
      return stripeInitialState.stripeState;
  }
  return state;
}


const reducerStripeState: (state: Stripe, action: PaymentStoresAction) => Stripe = combineReducers({
  stripeState
});

export function stripeStateReducer(state: Stripe = stripeInitialState, action: PaymentStoresAction): Stripe {
    return reducerStripeState(state, action);
}

// EOF: stripe state management

/**
 * IDEAL STATE MANAGEMENT
 */
export interface Ideal {
  idealState: IdealState;
}

export interface IdealState {
  status:
    'INITIAL'
  | 'INITIATING_PAYMENT_INTENT'
  | 'PAYMENT_INTENT_CREATED'
  | 'PAYMENT_INTENT_FAILED'
  ;
  idealPaymentIntent: StripeOrderData;
}

export const idealInitialState: Ideal = {
  idealState: {
    status: 'INITIAL',
    idealPaymentIntent: null
  }
};

export function idealState(
  state: IdealState = idealInitialState.idealState,
  action: PaymentStoresAction): IdealState {
  switch (action.type) {
    case PaymentActionType.CreateIdealPaymentIntent:
      return {
        ...state,
        status: 'INITIATING_PAYMENT_INTENT'
      };
    case PaymentActionType.CreateIdealPaymentIntentSuccess:
      return {
        ...state,
        status: 'PAYMENT_INTENT_CREATED',
        idealPaymentIntent: action.paymentIntent
      };
    case PaymentActionType.CreateIdealPaymentIntentFailed:
      return {
        ...state,
        status: 'PAYMENT_INTENT_FAILED',
      };
    case PaymentActionType.ClearIdealPaymentIntent:
      return idealInitialState.idealState;
  }
  return state;
}


const reducerIdealState: (state: Ideal, action: PaymentStoresAction) => Ideal = combineReducers({
  idealState
});

export function idealStateReducer(state: Ideal = idealInitialState, action: PaymentStoresAction): Ideal {
    return reducerIdealState(state, action);
}

// EOF: iDeal state management

/**
 * BANCONTACT STATE MANAGEMENT
 */
export interface Bancontact {
  bancontactState: BancontactState;
}

export interface BancontactState {
  status:
    'INITIAL'
  | 'INITIATING_PAYMENT_INTENT'
  | 'PAYMENT_INTENT_CREATED'
  | 'PAYMENT_INTENT_FAILED'
  ;
  bancontactPaymentIntent: StripeOrderData;
}

export const bancontactInitialState: Bancontact = {
  bancontactState: {
    status: 'INITIAL',
    bancontactPaymentIntent: null
  }
};

export function bancontactState(
    state: BancontactState = bancontactInitialState.bancontactState,
    action: PaymentStoresAction): BancontactState {
    switch (action.type) {
      case PaymentActionType.CreateBancontactPaymentIntent:
        return {
          ...state,
          status: 'INITIATING_PAYMENT_INTENT'
        };
      case PaymentActionType.CreateBancontactPaymentIntentSuccess:
        return {
          ...state,
          status: 'PAYMENT_INTENT_CREATED',
          bancontactPaymentIntent: action.paymentIntent
        };
      case PaymentActionType.CreateBancontactPaymentIntentFailed:
        return {
          ...state,
          status: 'PAYMENT_INTENT_FAILED',
        };
      case PaymentActionType.ClearBancontactPaymentIntent:
        return bancontactInitialState.bancontactState;
    }
    return state;
  }


const reducerBancontactState: (state: Bancontact, action: PaymentStoresAction) => Bancontact = combineReducers({
  bancontactState
});

export function bancontactStateReducer(state: Bancontact = bancontactInitialState, action: PaymentStoresAction): Bancontact {
    return reducerBancontactState(state, action);
}

// EOF: Bancontact state management

// Viva state management
export interface Viva {
  vivaState: VivaState;
}

export interface VivaState {
  status:
    'INITIAL' |
    'TOKEN_REQUEST' |
    'TOKEN_REQUEST_SUCCESS' |
    'TOKEN_REQUEST_FAILURE' |
    'CHARGE_REQUEST' |
    'CHARGE_REQUEST_SUCCESS' |
    'CHARGE_REQUEST_FAILURE'
  ;
  vivaToken: VivaToken;
}

export const vivaInitialState: Viva = {
  vivaState: {
    status: 'INITIAL',
    vivaToken: {
      accessToken: null,
      expiresIn: null
    }
  }
};

export function vivaState(state: VivaState = vivaInitialState.vivaState, action: PaymentStoresAction | StoreAction): VivaState {
  switch (action.type) {
    case PaymentActionType.CreateVivaPaymentToken:
      return {
        ...state,
        status: 'TOKEN_REQUEST'
      };
    case PaymentActionType.CreateVivaPaymentTokenSuccess:
      return {
        status: 'TOKEN_REQUEST_SUCCESS',
        vivaToken: action.token
      };
    case PaymentActionType.CreateVivaPaymentTokenFailed:
      return {
        status: 'TOKEN_REQUEST_FAILURE',
        vivaToken: vivaInitialState.vivaState.vivaToken
      };
    case PaymentActionType.ChargeVivaPayment:
      return {
        ...state,
        status: 'CHARGE_REQUEST'
      };
    case PaymentActionType.ChargeVivaPaymentSuccess:
      return {
        ...state,
        status: 'CHARGE_REQUEST_SUCCESS'
      };
    case PaymentActionType.ChargeVivaPaymentFailed:
      return {
        ...state,
        status: 'CHARGE_REQUEST_FAILURE'
      };
    case PaymentActionType.ClearVivaPayment:
      return vivaInitialState.vivaState;
    case StoreActionType.ClearCheckoutState:
      return vivaInitialState.vivaState;

  }
  return state;
}

const reducerVivaState: (state: Viva, action: PaymentStoresAction) => Viva = combineReducers({
  vivaState
});

export function vivaStateReducer(state: Viva = vivaInitialState, action: PaymentStoresAction): Viva {
  return reducerVivaState(state, action);
}

// EOF Viva state management

/**
 * Digital Wallets STATE MANAGEMENT
 */
export interface DigitalWallets {
  digitalWalletsState: DigitalWalletsState;
}

export interface DigitalWalletsState {
  status:
    'INITIAL'
  | 'INITIATING_PAYMENT_INTENT'
  | 'PAYMENT_INTENT_CREATED'
  | 'PAYMENT_INTENT_FAILED'
  ;
  digitalWalletsPaymentIntent: StripeOrderData;
}

export const digitalWalletsInitialState: DigitalWallets = {
  digitalWalletsState: {
    status: 'INITIAL',
    digitalWalletsPaymentIntent: null
  }
};

export function digitalWalletsState(
  state: DigitalWalletsState = digitalWalletsInitialState.digitalWalletsState,
  action: PaymentStoresAction): DigitalWalletsState {
  switch (action.type) {
    case PaymentActionType.CreateStripeDigitalWalletPaymentIntent:
      return {
        ...state,
        status: 'INITIATING_PAYMENT_INTENT'
      };
    case PaymentActionType.CreateStripeDigitalWalletPaymentIntentSuccess:
      return {
        ...state,
        status: 'PAYMENT_INTENT_CREATED',
        digitalWalletsPaymentIntent: action.paymentIntent
      };
    case PaymentActionType.CreateStripeDigitalWalletPaymentIntentFailed:
      return {
        ...state,
        status: 'PAYMENT_INTENT_FAILED',
      };
    case PaymentActionType.ClearStripeDigitalWalletPaymentIntent:
      return digitalWalletsInitialState.digitalWalletsState;
  }
  return state;
}


const reducerDigitalWalletsState: (state: DigitalWallets, action: PaymentStoresAction) => DigitalWallets = combineReducers({
  digitalWalletsState
});

export function digitalWalletsStateReducer(
  state: DigitalWallets = digitalWalletsInitialState,
  action: PaymentStoresAction
): DigitalWallets {
    return reducerDigitalWalletsState(state, action);
}

// EOF: Digital Wallets state management


// Paymentsense state management
export interface Paymentsense {
  paymentSenseState: PaymentsenseState;
}

export interface PaymentsenseState {
  status:
    'INITIAL' |
    'TOKEN_REQUEST' |
    'TOKEN_REQUEST_SUCCESS' |
    'TOKEN_REQUEST_FAILURE' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  paymentSenseToken: PaymentsenseToken;
}

export const paymentSenseInitialState: Paymentsense = {
  paymentSenseState: {
    status: 'INITIAL',
    paymentSenseToken: {
      id: null,
      expiresAt: null
    }
  }
};

export function paymentSenseState(
  state: PaymentsenseState = paymentSenseInitialState.paymentSenseState,
  action: PaymentStoresAction | StoreAction
): PaymentsenseState {
  switch (action.type) {
    case PaymentActionType.CreatePaymentsenseToken:
      return {
        ...state,
        status: 'TOKEN_REQUEST'
      };
    case PaymentActionType.CreatePaymentsenseTokenSuccess:
      return {
        status: 'TOKEN_REQUEST_SUCCESS',
        paymentSenseToken: action.token
      };
    case PaymentActionType.CreatePaymentsenseTokenFailed:
      return {
        status: 'TOKEN_REQUEST_FAILURE',
        paymentSenseToken: paymentSenseInitialState.paymentSenseState.paymentSenseToken
      };
    case PaymentActionType.CompletePaymentsensePaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompletePaymentsensePaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearPaymentsense:
      return paymentSenseInitialState.paymentSenseState;

  }
  return state;
}

const reducerPaymentsenseState: (state: Paymentsense, action: PaymentStoresAction) => Paymentsense = combineReducers({
  paymentSenseState
});

export function paymentSenseStateReducer(state: Paymentsense = paymentSenseInitialState, action: PaymentStoresAction): Paymentsense {
  return reducerPaymentsenseState(state, action);
}

// EOF Paymentsense state management


// RMS state management
export interface RMS {
  rmsState: RMSState;
}

export interface RMSState {
  status:
    'INITIAL' |
    'INIT_PAYMENT' |
    'INIT_PAYMENT_SUCCESS' |
    'INIT_PAYMENT_FAILURE' |
    'COMPLETE_PAYMENT' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  requestJSON: RMSRequestJSON;
}

export const rmsInitialState: RMS = {
  rmsState: {
    status: 'INITIAL',
    requestJSON: null,
  }
};

export function rmsState(
  state: RMSState = rmsInitialState.rmsState,
  action: PaymentStoresAction | StoreAction
): RMSState {
  switch (action.type) {
    case PaymentActionType.CreateRMSRequestJSON:
      return {
        ...state,
        status: 'INIT_PAYMENT'
      };
    case PaymentActionType.CreateRMSRequestJSONSuccess:
      return {
        status: 'INIT_PAYMENT_SUCCESS',
        requestJSON: action.token
      };
    case PaymentActionType.CreateRMSRequestJSONFailed:
      return {
        status: 'INIT_PAYMENT_FAILURE',
        requestJSON: rmsInitialState.rmsState.requestJSON
      };
    case PaymentActionType.CompleteRMSPaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompleteRMSPaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearRMSPayment:
      return rmsInitialState.rmsState;

  }
  return state;
}

const reducerRMSState: (state: RMS, action: PaymentStoresAction) => RMS = combineReducers({
  rmsState
});

export function rmsStateReducer(state: RMS = rmsInitialState, action: PaymentStoresAction): RMS {
  return reducerRMSState(state, action);
}

// EOF RMS state management


// TrustPayments state management

export interface TrustPayments {
  trustPaymentsState: TrustPaymentsState;
}

export interface TrustPaymentsState {
  status:
    'INITIAL' |
    'INIT_PAYMENT' |
    'INIT_PAYMENT_SUCCESS' |
    'INIT_PAYMENT_FAILURE' |
    'COMPLETE_PAYMENT' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  requestJSON: TrustPaymentsRequestJSON;
}

export const trustPaymentsInitialState: TrustPayments = {
  trustPaymentsState: {
    status: 'INITIAL',
    requestJSON: null,
  }
};

export function trustPaymentsState(
  state: TrustPaymentsState = trustPaymentsInitialState.trustPaymentsState,
  action: PaymentStoresAction | StoreAction
): TrustPaymentsState {
  switch (action.type) {
    case PaymentActionType.CreateTrustPaymentsRequestJSON:
      return {
        ...state,
        status: 'INIT_PAYMENT'
      };
    case PaymentActionType.CreateTrustPaymentsRequestJSONSuccess:
      return {
        status: 'INIT_PAYMENT_SUCCESS',
        requestJSON: action.token
      };
    case PaymentActionType.CreateTrustPaymentsRequestJSONFailed:
      return {
        status: 'INIT_PAYMENT_FAILURE',
        requestJSON: trustPaymentsInitialState.trustPaymentsState.requestJSON
      };
    case PaymentActionType.CompleteTrustPaymentsPaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompleteTrustPaymentsPaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearTrustPaymentsPayment:
      return trustPaymentsInitialState.trustPaymentsState;

  }
  return state;
}

const reducerTrustPaymentsState: (state: TrustPayments, action: PaymentStoresAction) => TrustPayments = combineReducers({
  trustPaymentsState
});

export function trustPaymentsStateReducer(state: TrustPayments = trustPaymentsInitialState, action: PaymentStoresAction): TrustPayments {
  return reducerTrustPaymentsState(state, action);
}

// EOF TrustPayments state management

// JCC state management
export interface JCC {
  jccState: JCCState;
}

export interface JCCState {
  status:
    'INITIAL' |
    'INIT_PAYMENT' |
    'INIT_PAYMENT_SUCCESS' |
    'INIT_PAYMENT_FAILURE' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  requestJSON: JCCRequestJSON;
}

export const jccInitialState: JCC = {
  jccState: {
    status: 'INITIAL',
    requestJSON: null,
  }
};

export function jccState(
  state: JCCState = jccInitialState.jccState,
  action: PaymentStoresAction | StoreAction
): JCCState {
  switch (action.type) {
    case PaymentActionType.CreateJCCRequestJSON:
      return {
        ...state,
        status: 'INIT_PAYMENT'
      };
    case PaymentActionType.CreateJCCRequestJSONSuccess:
      return {
        status: 'INIT_PAYMENT_SUCCESS',
        requestJSON: action.token
      };
    case PaymentActionType.CreateJCCRequestJSONFailed:
      return {
        status: 'INIT_PAYMENT_FAILURE',
        requestJSON: jccInitialState.jccState.requestJSON
      };
    case PaymentActionType.CompleteJCCPaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompleteJCCPaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearJCCPayment:
      return jccInitialState.jccState;

  }
  return state;
}

const reducerJCCState: (state: JCC, action: PaymentStoresAction) => JCC = combineReducers({
  jccState
});

export function jccStateReducer(state: JCC = jccInitialState, action: PaymentStoresAction): JCC {
  return reducerJCCState(state, action);
}

// EOF JCC state management
