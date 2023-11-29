import { UserAction, UserActionType } from './user.actions';
import { combineReducers } from '@ngrx/store';
import { UserAffiliate } from '../../api/types/UserAffiliate';
import { Voucher, Commission } from '../../stores/stores';
import { Paging } from '../../api/types/Pageable';

export const userAffiliateInitialState: UserAffiliate = {
  dafaultVoucherTimesUse: 0,
  defaultVoucherDiscount: 0,
  defaultVoucherValue: 0,
  eligibleToUpgrade: false,
  isAffiliate: false,
  maxAvailableVouchers: 0,
  maxDaysVoucherDuration: 0,
  maxVoucherDiscount: 0,
  minVoucherDiscount: 0,
  remainingVouchers: 0,
  defaultCurrency: '',
  status: '',
  paymentDetails: ''
};

export interface UserAffiliateState {
  affiliate: UserAffiliate;
}

export function userAffiliate(
  state = userInitialState.userAffiliate,
  action: UserAction
): UserAffiliateState {
  switch (action.type) {
    case UserActionType.GetUserAffiliateSuccess:
      return { ...state, affiliate: action.affiliate };
    case UserActionType.GetUserAffiliateFailed:
      return { ...state, affiliate: null };
    default:
      return state;
  }
}
export interface VouchersList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: Voucher[];
  paging: Paging;
  totalPages: number;
}

export interface CommissionsList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: Commission[];
  paging: Paging;
  totalPages: number;
}

export interface LoadVoucherPaymentMethod {
  data: string;
}

export interface User {
  userAffiliate: UserAffiliateState;
  voucherList: VouchersList;
  commissionList: CommissionsList;
  paymentMethod: LoadVoucherPaymentMethod;
}

export interface UserState {
  user: User;
}

export const selectedVoucherInitialState: Voucher = {
  id: null,
  code: '',
  endDate: null,
  createdAt: null,
  updatedAt: null,
  maxTimesUse: null,
  value: null,
  discount: null,
  owner: null,
  commission: null,
  comment: '',
  voucherAssignmentStatus: '',
  formattedDiscountAmount: '',
  formattedCommissionAmount: ''
};

export const userInitialState: User = {
  userAffiliate: {
    affiliate: userAffiliateInitialState
  },
  voucherList: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 5 },
    totalPages: 0
  },
  commissionList: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 5 },
    totalPages: 0
  },
  paymentMethod: {
    data: ''
  }
};

export function voucherList(state: VouchersList = userInitialState.voucherList, action: UserAction): VouchersList {

  switch (action.type) {
    case UserActionType.LoadVouchers:
    case UserActionType.LoadVouchersPage:
      return { ...state, status: 'LOADING', paging: action.paging };
    case UserActionType.LoadVouchersSuccess:
      return {
        status: 'LOADED',
        data: action.vouchers.data,
        paging: { ...state.paging, page: action.vouchers.pageNumber },
        totalPages: action.vouchers.totalPages
      };
    case UserActionType.LoadVouchersFailed:
      return { ...userInitialState.voucherList, status: 'FAILED' };
    default:
      return state;
  }
}

export function commissionList(state: CommissionsList = userInitialState.commissionList, action: UserAction): CommissionsList {

  switch (action.type) {
    case UserActionType.LoadCommissions:
    case UserActionType.LoadCommissionsPage:
      return { ...state, status: 'LOADING', paging: action.paging };
    case UserActionType.LoadCommissionsSuccess:
      return {
        status: 'LOADED',
        data: action.vouchers.data,
        paging: { ...state.paging, page: action.vouchers.pageNumber },
        totalPages: action.vouchers.totalPages
      };
    case UserActionType.LoadCommissionsFailed:
      return { ...userInitialState.commissionList, status: 'FAILED' };
    default:
      return state;
  }
}

export function paymentMethod(state: LoadVoucherPaymentMethod = userInitialState.paymentMethod, action: UserAction)
  : LoadVoucherPaymentMethod {
  switch (action.type) {
    case UserActionType.GetVoucherPaymentMethod:
      return { ...state };
    case UserActionType.GetVoucherPaymentMethodSuccess:
      return {
        ...state,
        data: action.paymentMethodComment
      };
    case UserActionType.GetVoucherPaymentMethodFailed:
      return { ...state, data: userInitialState.paymentMethod.data };
    default:
      return state;
  }
}

const userReducer: (state: User, action: UserAction) => User = combineReducers({
  userAffiliate,
  voucherList,
  commissionList,
  paymentMethod,
});

export function usersReducer(state: User = userInitialState, action: UserAction): User {
  return userReducer(state, action);
}
