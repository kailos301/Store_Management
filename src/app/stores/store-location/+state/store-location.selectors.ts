import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StoreLocations } from './store-location.reducer';

export const getStoreLocationsState = createFeatureSelector<StoreLocations>('storesLocation');
export const getStoreLocationsList = createSelector(getStoreLocationsState, (state: StoreLocations) => state.listLocation);
export const getSelectedStoreLocation = createSelector(
    getStoreLocationsState,
    (state: StoreLocations) => state.selectedStoreLocation,
);
export const getSelectedStoreLocationStatus = createSelector(
    getStoreLocationsState,
    (state: StoreLocations) => state.selectedStoreLocationStatus,
);
export const getCreationFormVisible = createSelector(getStoreLocationsState, (state: StoreLocations) => state.creationFormVisible);
