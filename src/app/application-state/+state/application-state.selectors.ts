import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicationState } from './application-state.reducer';

export const getApplicationState = createFeatureSelector<ApplicationState>('appState');
export const isNewVersionAvailable = createSelector(getApplicationState, (state: ApplicationState) => state.appVersion.newVersionAvailable);
