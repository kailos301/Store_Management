import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { LoadStores } from './+state/stores.actions';
import { UserState } from '../user/+state/user.reducer';
import { GetUser } from '../account/+state/account.actions';
import { getUserId } from '../auth/+state/auth.selectors';
import { filter, tap, map } from 'rxjs/operators';
import { getStoresList } from './+state/stores.selectors';
import { LocalStorageService } from '../local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class StoresListGuard implements CanActivate {

  constructor(private stores: Store<any>,  private storageService: LocalStorageService) { }

  canActivate() {
    return this.stores.pipe(
      select(getStoresList),
      tap(_ => this.stores.dispatch(new GetUser())),
      map(store => {
        if (store.status === 'INITIAL' || store.status === 'FAILED') {
          this.storageService.removeSavedState('aliasName');
          this.stores.dispatch(new LoadStores({ page: 0, size: 10 }, ''));
        }
        return true;
      }));
  }
}
