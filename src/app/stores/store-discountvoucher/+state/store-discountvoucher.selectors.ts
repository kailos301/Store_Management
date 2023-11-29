import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DiscountVoucher } from './store-discountvoucher.reducer';



export const getDiscountVoucherState = createFeatureSelector<DiscountVoucher>('discountVoucher');
export const getDiscountVoucherList = createSelector(getDiscountVoucherState, (state: DiscountVoucher) => state.discountVoucherlist.data);
export const getSelectedDiscountVoucher
              = createSelector(getDiscountVoucherState, (state: DiscountVoucher) => state.selectedDiscountVoucher);
