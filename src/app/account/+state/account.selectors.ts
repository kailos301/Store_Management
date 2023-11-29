import {Account} from './account.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const getUserState = createFeatureSelector<Account>('account');
export const getProfile = createSelector(getUserState, (state: Account) => state.profile);
export const getUpdateStatus = createSelector(getUserState, (state: Account) => state.accountUpdate.status);
export const getUpdateErrors = createSelector(getUserState, (state: Account) => state.accountUpdate.errors);
export const getChangePasswordStatus = createSelector(getUserState, (state: Account) => state.passwordChange.status);
export const getChangePasswordErrors = createSelector(getUserState, (state: Account) => state.passwordChange.errors);
export const getCreatePasswordStatus = createSelector(getUserState, (state: Account) => state.passwordCreate.status);
export const getCreatePasswordErrors = createSelector(getUserState, (state: Account) => state.passwordCreate.errors);
