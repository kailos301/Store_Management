import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Loader } from './loader.reducer';

export const getLoaderState = createFeatureSelector<Loader>('loader');
export const isLoaderActive = createSelector(getLoaderState, (state: Loader) => state.active);
