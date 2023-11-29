import { InjectionToken } from '@angular/core';
import { StoreConfig } from '@ngrx/store';
import { UsersAction } from './+state/users.actions';
import { UsersState } from './+state/users.reducer';

export const USERS_LOCAL_STORAGE_KEY = new InjectionToken<string>('UsersStorage');
export const USERS_CONFIG_TOKEN = new InjectionToken<StoreConfig<UsersState, UsersAction>>('UsersConfigToken');
