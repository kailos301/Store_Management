import { ClientStoreLocation } from '../store-location';
import { Paging } from 'src/app/api/types/Pageable';
import { StoreLocationAction, StoreLocationActionType } from './store-location.actions';
import { combineReducers } from '@ngrx/store';
import { ApiRequestStatus } from 'src/app/api/types/Status';

export interface StoreLocationList {
  status: ApiRequestStatus;
  data: ClientStoreLocation[];
  paging: Paging;
  totalPages: number;
}

export interface StoreLocations {
  listLocation: StoreLocationList;
  selectedStoreLocation: ClientStoreLocation;
  selectedStoreLocationStatus: ApiRequestStatus;
  creationFormVisible: boolean;
}

export interface StoresLocationsState {
  stores: StoreLocations;
}

export const storesLocationInitialState: StoreLocations = {
  listLocation: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 24 },
    totalPages: 0
  },
  selectedStoreLocation: { id: null, label: '' },
  selectedStoreLocationStatus: 'INITIAL',
  creationFormVisible: false
};

export function listLocation(
  state: StoreLocationList = storesLocationInitialState.listLocation,
  action: StoreLocationAction
): StoreLocationList {
  switch (action.type) {
    case StoreLocationActionType.Initialize:
      return { ...storesLocationInitialState.listLocation };
    case StoreLocationActionType.LoadStoreLocations:
    case StoreLocationActionType.LoadStoreLocationsPage: {
      return { ...state, status: 'LOADING', paging: action.paging };
    }
    case StoreLocationActionType.LoadStoreLocationsSuccess:
      return {
        status: 'LOADED',
        data: action.stores.data,
        paging: { ...state.paging, page: action.stores.pageNumber },
        totalPages: action.stores.totalPages
      };
    case StoreLocationActionType.LoadStoreLocationsFail:
      return { ...storesLocationInitialState.listLocation, status: 'FAILED' };
    default:
      return state;
  }
}

export function selectedStoreLocation(
  state: ClientStoreLocation = storesLocationInitialState.selectedStoreLocation,
  action: StoreLocationAction
): ClientStoreLocation {

  switch (action.type) {
    case StoreLocationActionType.InitializeSelectedStoreLocation:
      return storesLocationInitialState.selectedStoreLocation;
    case StoreLocationActionType.LoadSelectedStoreLocationSuccess:
      return action.location;
  }
  return state;
}

export function selectedStoreLocationStatus(
  state: ApiRequestStatus = storesLocationInitialState.selectedStoreLocationStatus,
  action: StoreLocationAction
): ApiRequestStatus {

  switch (action.type) {
    case StoreLocationActionType.InitializeSelectedStoreLocation:
      return 'INITIAL';
    case StoreLocationActionType.LoadSelectedStoreLocation:
      return 'LOADING';
    case StoreLocationActionType.LoadSelectedStoreLocationSuccess:
      return 'LOADED';
    case StoreLocationActionType.LoadSelectedStoreLocationFailed:
      return 'FAILED';
  }
  return state;
}

export function creationFormVisible(
  state: boolean = storesLocationInitialState.creationFormVisible,
  action: StoreLocationAction
): boolean {
  switch (action.type) {
    case StoreLocationActionType.Initialize:
      return false;
    case StoreLocationActionType.OpenStoreLocationCreationForm:
      return true;
    case StoreLocationActionType.CloseStoreLocationCreationForm:
      return false;
  }
  return state;
}

const reducerLocation: (state: StoreLocations, action: StoreLocationAction) => StoreLocations = combineReducers({
  listLocation,
  selectedStoreLocation,
  selectedStoreLocationStatus,
  creationFormVisible
});

export function storesLocationReducer(
  state: StoreLocations = storesLocationInitialState,
  action: StoreLocationAction
): StoreLocations {
  return reducerLocation(state, action);
}
