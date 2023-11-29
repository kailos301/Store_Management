import { UserProfile } from '../../api/types/User';
import { AccountAction, AccountActionType, UpdateUserSuccess, ChangePasswordSuccess, SendEmail } from './account.actions';
import { combineReducers } from '@ngrx/store';

export interface AccountState {
    user: Account;
}

export interface Account {
    profile: UserProfile;
    accountUpdate: AccountUpdateState;
    passwordChange: AccountUpdateState;
    passwordCreate: AccountUpdateState;
    socialAccountLink: AccountUpdateState;
}

export interface AccountUpdateState {
    status: 'INITIAL' | 'SUCCESS' | 'FAILED';
    errors?: string[];
}

export const accountInitialState: Account = {
    profile: {
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: ''
    },
    accountUpdate: {status: 'INITIAL'},
    passwordChange: {status: 'INITIAL'},
    passwordCreate: {status: 'INITIAL'},
    socialAccountLink: {status: 'INITIAL'}
};

export function profile(state: UserProfile = accountInitialState.profile, action: AccountAction): UserProfile {
    switch (action.type) {
        case AccountActionType.GetUserSuccess:
        case AccountActionType.UpdateUserSuccess:
            return action.user;
        default:
            return state;
    }
}

export function accountUpdate(state: AccountUpdateState = accountInitialState.accountUpdate, action: AccountAction): AccountUpdateState {
    switch (action.type) {
        case AccountActionType.UpdateUserSuccess:
            return {status: 'SUCCESS'};
        case AccountActionType.UpdateUserFailed:
            return {status: 'FAILED', errors: action.errors};
        default:
            return state;
    }
}

export function passwordChange(state: AccountUpdateState = accountInitialState.passwordChange, action: AccountAction): AccountUpdateState {
    switch (action.type) {
        case AccountActionType.ChangePasswordSuccess:
            return {status: 'SUCCESS'};
        case AccountActionType.ChangePasswordFailed:
            return {status: 'FAILED', errors: action.errors};
        default:
            return state;
    }
}

export function passwordCreate(state: AccountUpdateState = accountInitialState.passwordCreate, action: AccountAction): AccountUpdateState {
    switch (action.type) {
        case AccountActionType.CreatePasswordSuccess:
            return {status: 'SUCCESS'};
        case AccountActionType.CreatePasswordFailed:
            return {status: 'FAILED', errors: action.errors};
        default:
            return state;
    }
}

export function socialAccountLink(state: AccountUpdateState = accountInitialState.socialAccountLink, action: AccountAction)
    : AccountUpdateState {
    switch (action.type) {
        case AccountActionType.LinkSocialAccountSuccess:
            return {status: 'SUCCESS'};
        case AccountActionType.LinkSocialAccountFailed:
            return {status: 'FAILED', errors: action.errors};
        default:
            return state;
    }
}

const reducer: (state: Account, action: AccountAction) => Account = combineReducers({
    profile,
    accountUpdate,
    passwordChange,
    passwordCreate,
    socialAccountLink
});

export function accountReducer(state: Account = accountInitialState, action: AccountAction): Account {
    return reducer(state, action);
}
