import { combineReducers } from '@ngrx/store';
import { PageableResults } from 'src/app/api/types/Pageable';
import { SaveDiscountVoucherView } from '../store-discountvoucher.helpers';
import { StoresAction, StoresActionType } from './store-discountvoucher.actions';


export interface DiscountVoucherState {
    discountVoucher: DiscountVoucher;
  }

export interface DiscountVoucher {
  discountVoucherlist: DiscountVoucherList;
  selectedDiscountVoucher: SaveDiscountVoucherView;
}

export interface DiscountVoucherList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: PageableResults<SaveDiscountVoucherView>;
  errorMessage: any;
}
export const discountVoucherInitialState: DiscountVoucher = {
  discountVoucherlist: {
    status: 'INITIAL',
    data: null,
    errorMessage: ''
  },
  selectedDiscountVoucher: null
};

export function discountVoucherlist(
  state: DiscountVoucherList = discountVoucherInitialState.discountVoucherlist,
  action: StoresAction,
): DiscountVoucherList {
    switch (action.type) {
      case StoresActionType.LoadDiscountVouchers:
        return { ...state, status: 'LOADING' };
      case StoresActionType.LoadDiscountVouchersSuccess:
        return {
          status: 'LOADED',
          data: action.discountVouchers,
          errorMessage: ''
        };
      case StoresActionType.LoadDiscountVouchersFailed:
        return { ...discountVoucherInitialState[''], status: 'FAILED' };
      default:
        return state;
    }
  }

export function selectedDiscountVoucher(
  state: SaveDiscountVoucherView = discountVoucherInitialState.selectedDiscountVoucher,
  action: StoresAction
): SaveDiscountVoucherView {
    switch (action.type) {
      case StoresActionType.LoadDiscountVoucher:
        return null;
      case StoresActionType.LoadDiscountVoucherSuccess:
        return action.discountVoucher;
      case StoresActionType.LoadDiscountVoucherFailed:
        return { ...discountVoucherInitialState.selectedDiscountVoucher };
      default:
        return state;
    }
  }
const reducerDiscountVouchers: (state: DiscountVoucher, action: StoresAction) => DiscountVoucher = combineReducers({
    discountVoucherlist,
    selectedDiscountVoucher
  });

export function storesDiscountVoucherReducer(state: DiscountVoucher = discountVoucherInitialState, action: StoresAction): DiscountVoucher {
    return reducerDiscountVouchers(state, action);
  }
