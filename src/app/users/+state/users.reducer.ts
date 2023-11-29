import { combineReducers } from '@ngrx/store';

import { PageableResults, Paging, defaultPaging } from 'src/app/api/types/Pageable';
import { ApiRequestStatus } from 'src/app/api/types/Status';

import {UsersAction, UsersActionType} from './users.actions';
import {
  ClientUser
} from '../users';

export interface UserList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: ClientUser[];
  paging: Paging;
  totalPages: number;
}

export interface Users {
  list: UserList;
  loadingUserId: number;
  selectedUser: SelectedUserState;
}

export interface UsersState {
  users: Users;
}

export interface SelectedUserState {
  user: ClientUser;
  status: ApiRequestStatus;
}


export const selectedUserInitialState: ClientUser = {
  id: -1,
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  emailVerified: '',
  phoneNumber: '',
  country: {
    id: null,
    name: '',
    code: '',
    phoneCode: '',
    defaultLocale: '',
    defaultTimeZone: '',
    subscriptionPrice: 0,
    subscriptionCurrency: '',
    europeanCountry: false,
  },
  preferredLanguage: {
    id: null,
    name: '',
    locale: '',
    code: '',
    covered_admin_ui: false,
    covered_customer_ui: false
  },
  storeRole: '',
  roles: [],
};

export const usersInitialState: Users = {
  list: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 10 },
    totalPages: 0
  },
  loadingUserId: -1,
  selectedUser: {
    user: selectedUserInitialState,
    status: 'INITIAL',
  },
};

export function list(
  state: UserList = usersInitialState.list,
  action: UsersAction
): UserList {
  switch (action.type) {
    case UsersActionType.LoadUsers:
      return { ...state, status: 'LOADING', paging: action.paging };
    case UsersActionType.SearchUser:
      return { ...state, status: 'LOADING', paging: defaultPaging};
    case UsersActionType.LoadUsersSuccess:
      return {
        status: 'LOADED',
        data: action.users.data,
        paging: { ...state.paging, page: action.users.pageNumber },
        totalPages: action.users.totalPages
      };
    case UsersActionType.LoadUsersFailed:
      return { ...usersInitialState.list, status: 'FAILED' };
    case UsersActionType.SetUserEmailStatusSuccess:
      return {
        ...state,
        data: state.data.map(u => (u.id === action.userid ? {...u, emailVerified: action.emailStatus} : u))
      };
    default:
      return state;
  }
}

export function loadingUserId(state: number = usersInitialState.loadingUserId, action: UsersAction): number {
  switch (action.type) {
    case UsersActionType.LoadUser:
      return action.id;
    case UsersActionType.LoadUserFailed:
      return -1;
    default:
      return state;
  }
}
export function selectedUser(state: SelectedUserState = usersInitialState.selectedUser, action: UsersAction): SelectedUserState {
  switch (action.type) {
    case UsersActionType.LoadUser:
      return { user: { ...selectedUserInitialState }, status: 'LOADING'};
    case UsersActionType.LoadUserSuccess:
      return { user: action.user, status: 'LOADED' };
    case UsersActionType.LoadUserFailed:
      return { ...state, status: 'FAILED' };
    case UsersActionType.SetUserEmailStatusSuccess:
      return { ...state, user: {...state.user, emailVerified: action.emailStatus}};
    case UsersActionType.DeleteUserSuccess:
      return { user: { ...selectedUserInitialState }, status: 'INITIAL' };
  }
  return state;
}

const reducer: (state: Users, action: UsersAction) => Users = combineReducers({
  list,
  loadingUserId,
  selectedUser,
});

export function usersReducer(state: Users = usersInitialState, action: UsersAction): Users {
  return reducer(state, action);
}
