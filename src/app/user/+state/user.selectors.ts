import {User} from './user.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const getUserState = createFeatureSelector<User>('user');
export const getUserAffiliate = createSelector(getUserState, (state: User) => state.userAffiliate.affiliate);
export const getVouchersList = createSelector(getUserState, (state: User) => state.voucherList);
export const getCommissionsList = createSelector(getUserState, (state: User) => state.commissionList);
export const getVoucherPaymentMethod = createSelector(getUserState, (state: User) => state.paymentMethod);

