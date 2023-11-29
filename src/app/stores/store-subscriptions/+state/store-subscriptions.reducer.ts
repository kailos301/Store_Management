import { StorePurchase } from './../subscriptions';
import { combineReducers } from '@ngrx/store';
import { StoreSubscriptionsActionType, StoreSubscriptionsAction } from './store-subscriptions.actions';

export type STATUS_TYPE = 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';

export interface StoreSubscriptionsState {
  storeSubscriptions: StoreSubscriptions;
}

export interface StoreSubscriptionList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: StorePurchase[];
}

export interface StoreSubscriptions {
  purchase: StorePurchase;
  status: STATUS_TYPE;
  list: StoreSubscriptionList;
  validationStatus?: VALIDATION_TYPE;
  invoice: StorePurchase;
}

export const storesSubscriptionsInitialState: StoreSubscriptions = {
  purchase: {
    id: -1,
    createdAt: '',
    updatedAt: '',
    status: 'DRAFT'
  },
  status: 'INITIAL',
  list: {
    status: 'INITIAL',
    data: []
  },
  validationStatus: [],
  invoice: {
    id: -1,
    createdAt: '',
    updatedAt: '',
    status: 'DRAFT'
  }
};

export type VALIDATION_TYPE = StorePurchase | string[] ;

export function purchase(state: StorePurchase = storesSubscriptionsInitialState.purchase,
                         action: StoreSubscriptionsAction): StorePurchase {
    switch (action.type) {
      case StoreSubscriptionsActionType.PurchaseSubscriptionSuccess:
      case StoreSubscriptionsActionType.UpdateSubscriptionPurchaseSuccess:
        return action.purchase;
      default:
        return state;
    }
}

export function status(state: STATUS_TYPE = storesSubscriptionsInitialState.status, action: StoreSubscriptionsAction): STATUS_TYPE {
  switch (action.type) {
    case StoreSubscriptionsActionType.UpdateSubscriptionPurchase:
    case StoreSubscriptionsActionType.PurchaseSubscription:
      return 'LOADING';
    case StoreSubscriptionsActionType.UpdateSubscriptionPurchaseSuccess:
    case StoreSubscriptionsActionType.PurchaseSubscriptionSuccess:
      return 'LOADED';
    case StoreSubscriptionsActionType.UpdateSubscriptionPurchaseFail:
    case StoreSubscriptionsActionType.PurchaseSubscriptionFail:
      return 'FAILED';
    default:
      return state;
  }
}
export function validationStatus(
  state: VALIDATION_TYPE = storesSubscriptionsInitialState.validationStatus,
  action: StoreSubscriptionsAction): any {
  switch (action.type) {
    case StoreSubscriptionsActionType.UpdateSubscriptionPurchaseSuccess:
    case StoreSubscriptionsActionType.PurchaseSubscriptionSuccess:
      return { ...action.purchase};
    case StoreSubscriptionsActionType.UpdateSubscriptionPurchaseFail:
    case StoreSubscriptionsActionType.PurchaseSubscriptionFail:
      return [...action.errorMessages];
    case StoreSubscriptionsActionType.UpdateSubscriptionPurchase:
    case StoreSubscriptionsActionType.PurchaseSubscription:
    default:
    return state;
  }
}
export function list(
  state: StoreSubscriptionList = storesSubscriptionsInitialState.list,
  action: StoreSubscriptionsAction): StoreSubscriptionList {
  switch (action.type) {
    case StoreSubscriptionsActionType.Initialize:
      return {...storesSubscriptionsInitialState.list};
    case StoreSubscriptionsActionType.PurchaseSubscriptions:
      return { ...state, status: 'LOADING'};
    case StoreSubscriptionsActionType.PurchaseSubscriptionsSuccess:
      return {
        status: 'LOADED',
        data: action.purchases
      };
    case StoreSubscriptionsActionType.PurchaseSubscriptionsFail:
      return { ...storesSubscriptionsInitialState.list, status: 'FAILED' };
    case StoreSubscriptionsActionType.UpdateSubscriptionPurchasesSuccess:
    default:
      return state;
  }
}
export function invoice(state: StorePurchase = storesSubscriptionsInitialState.invoice,
                        action: StoreSubscriptionsAction): StorePurchase {
    switch (action.type) {
      case StoreSubscriptionsActionType.LoadInvoiceSuccess:
        return action.purchase;
      default:
        return state;
    }
}
const reducerSubscriptions: (state: StoreSubscriptions, action: StoreSubscriptionsAction) => StoreSubscriptions = combineReducers({
  purchase,
  status,
  list,
  validationStatus,
  invoice
});

export function storesSubscriptionsReducer(
  state: StoreSubscriptions = storesSubscriptionsInitialState,
  action: StoreSubscriptionsAction): StoreSubscriptions {
  return reducerSubscriptions(state, action);
}
