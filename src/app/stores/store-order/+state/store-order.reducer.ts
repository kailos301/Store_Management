import { ClientStoreOrder } from '../store-order';
import { StoreOrderAction, StoreOrderActionType } from './store-order.actions';
import { combineReducers } from '@ngrx/store';
import { Paging } from 'src/app/api/types/Pageable';
import { Order } from '../../stores';

export interface StoreOrderList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: ClientStoreOrder[];
  paging: Paging;
  totalPages: number;
}

export interface StoreOrders {
  list: StoreOrderList;
  selectedOrder: Order;
  bulkUpdateStatus: string;
}

export interface StoresOrdersState {
  orders: StoreOrders;
}

export const storeOrdersInitialState: StoreOrders = {
  list: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 20 },
    totalPages: 0
  },
  selectedOrder: {uuid: '', status: 'SUBMITTED', currency: ''},
  bulkUpdateStatus: 'INITIAL'
};

export function list( state: StoreOrderList = storeOrdersInitialState.list, action: StoreOrderAction): StoreOrderList {
    switch (action.type) {
      case StoreOrderActionType.Initialize:
        return {...storeOrdersInitialState.list};
      case StoreOrderActionType.LoadStoreOrdersSortFilter:
        return { ...state, status: 'LOADING', paging: action.paging || {page: 0, size: 0}};
      case StoreOrderActionType.LoadStoreOrdersSortFilterSuccess:
        return {
          status: 'LOADED',
          data: action.orders.data,
          paging: { ...state.paging, page: action.orders.pageNumber },
          totalPages: action.orders.totalPages
        };
      case StoreOrderActionType.LoadStoreOrdersSortFilterFail:
        return { ...storeOrdersInitialState.list, status: 'FAILED' };
      case StoreOrderActionType.UpdateOrderStatusSuccess:
        const data = [...state.data].filter(o => o.uuid !== action.orderUuid);
        return { ...state, data };
      default:
        return state;
    }
}

export function selectedOrder(state: Order = storeOrdersInitialState.selectedOrder, action: StoreOrderAction): Order {
    switch (action.type) {
      case StoreOrderActionType.Initialize:
        return {...storeOrdersInitialState.selectedOrder};
      case StoreOrderActionType.LoadStoreOrderSuccess:
        return action.order;
    }
    return state;
}

export function bulkUpdateStatus(state: string = storeOrdersInitialState.bulkUpdateStatus, action: StoreOrderAction): string {
  switch (action.type) {
    case StoreOrderActionType.UpdateBulkOrderStatusSuccess:
      return 'SUCCESS';
  }
  return 'INITIAL';
}

const reducerLocation: (state: StoreOrders, action: StoreOrderAction) => StoreOrders = combineReducers({
  list,
  selectedOrder,
  bulkUpdateStatus
});

export function storeOrdersReducer(state: StoreOrders = storeOrdersInitialState, action: StoreOrderAction): StoreOrders {
  return reducerLocation(state, action);
}
