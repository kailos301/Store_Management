import { InjectionToken } from '@angular/core';
import { StoreConfig } from '@ngrx/store';
import { StoresAction } from './+state/stores.actions';
import { StoresState } from './+state/stores.reducer';

export const STORES_LOCAL_STORAGE_KEY = new InjectionToken<string>('StoresStorage');
export const STORES_CONFIG_TOKEN = new InjectionToken<StoreConfig<StoresState, StoresAction>>('StoresConfigToken');
