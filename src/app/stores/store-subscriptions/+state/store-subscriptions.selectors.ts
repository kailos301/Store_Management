import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StoreSubscriptions } from './store-subscriptions.reducer';

export const getStoreSubscriptionsState = createFeatureSelector<StoreSubscriptions>('storeSubscriptions');
export const getSubscriptionPurchase = createSelector(getStoreSubscriptionsState, (state: StoreSubscriptions) => state.purchase);
export const getStatus = createSelector(getStoreSubscriptionsState, (state: StoreSubscriptions) => state.status);
export const getPurchaseInvoicesList = createSelector(getStoreSubscriptionsState, (state: StoreSubscriptions) => state.list);
export const getValidations = createSelector(getStoreSubscriptionsState, (state: StoreSubscriptions) => state.validationStatus);
export const getSubscriptionInvoice = createSelector(getStoreSubscriptionsState, (state: StoreSubscriptions) => state.invoice);
