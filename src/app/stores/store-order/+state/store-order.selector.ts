import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StoreOrders } from './store-order.reducer';

export const getStoreOrdersState = createFeatureSelector<StoreOrders>('orders');
export const getStoreOrdersList = createSelector(getStoreOrdersState, (state: StoreOrders) => state.list);
export const getStoreOrdersLoadingStatus = createSelector(getStoreOrdersState, (state: StoreOrders) => state.list.status);
export const getStoreOrders = createSelector(getStoreOrdersState, (state: StoreOrders) => state.list.data);
export const getSelectedOrder = createSelector(getStoreOrdersState, (state: StoreOrders) => state.selectedOrder);

export const getUpdateBulkOrderStatus = createSelector(getStoreOrdersState, (state: StoreOrders) => state.bulkUpdateStatus);
