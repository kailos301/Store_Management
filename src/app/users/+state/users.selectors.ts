import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Users } from './users.reducer';

export const getUsersState = createFeatureSelector<Users>('allusers');
export const getUsersList = createSelector(getUsersState, (state: Users) => state.list);

export const getSelectedUser = createSelector(getUsersState, (state: Users) => state.selectedUser.user);
export const getSelectedUserApiStatus = createSelector(getUsersState, (state: Users) => state.selectedUser.status);

export const getLoadingUserId = createSelector(getUsersState, (state: Users) => state.loadingUserId);
