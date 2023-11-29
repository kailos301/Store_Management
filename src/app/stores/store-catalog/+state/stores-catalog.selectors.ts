import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Catalog, Offer, Category } from './stores-catalog.reducer';

export const getCatalogState = createFeatureSelector<Catalog>('catalog');
export const getCatalogOverview = createSelector(getCatalogState, (state: Catalog) => state.cataloglist.data);
export const getOfferState = createFeatureSelector<Offer>('offer');
export const getOfferDetails = createSelector(getOfferState, (state: Offer) => state.offerDetails.data);
export const getOfferStatus = createSelector(getOfferState, (state: Offer) => state.offerDetails.status);
export const getCategoryState = createFeatureSelector<Category>('category');
export const getCategoryDetails = createSelector(getCategoryState, (state: Category) => state.categoryDetails.data);
export const getCategoryStatus = createSelector(getCategoryState, (state: Category) => state.categoryDetails.status);
export const getOfferImage = createSelector(getOfferState, (state: Offer) => state.imageUrl);

export const getOfferAvailability = createSelector(getOfferState, (state: Offer) => state.availability);
