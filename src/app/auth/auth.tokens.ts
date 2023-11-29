import { AuthState } from './+state/auth.reducer';
import { AuthAction } from './+state/auth.actions';
import { InjectionToken } from '@angular/core';
import { StoreConfig } from '@ngrx/store';

export const AUTH_STORAGE_KEYS = new InjectionToken<keyof AuthState>('authStorageKey');
export const AUTH_LOCAL_STORAGE_KEY = new InjectionToken<string>('AuthStorage');
export const AUTH_CONFIG_TOKEN = new InjectionToken<StoreConfig<AuthState, AuthAction>>('AuthConfigToken');
