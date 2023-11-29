import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from './+state/stores.reducer';
import { getStoresList } from './+state/stores.selectors';
import { filter, map } from 'rxjs/operators';
import { getLoggedInUser } from '../auth/+state/auth.selectors';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoresNavigationGuard implements CanActivate {

    constructor(private store: Store<StoresState>, private router: Router) {}

    canActivate() {
        return combineLatest([
          this.store.pipe(select(getStoresList), filter(l => l.status === 'LOADED')),
          this.store.pipe(select(getLoggedInUser), filter(l => l.id !== -1))
        ]).pipe(map( ([storesList, loggedInUser]) => {
            if (storesList.data.length === 1) {
              const clientStore = storesList.data[0];
              if (clientStore.numberOfOffers > 0 && clientStore.numberOfOrders > 0 && clientStore.settings.ENABLE_ORDERING === true) {
                this.router.navigate(['/manager/stores/', clientStore.id, 'orders']);
              } else {
                if (loggedInUser.storeRoles[clientStore.id] === 'STORE_STANDARD') {
                  this.router.navigate(['/manager/stores/', clientStore.id, 'orders']);
                } else {
                  this.router.navigate(['/manager/stores/', clientStore.id, 'catalog']);
                }
              }
            } else {
              this.router.navigate(['/manager/stores/list']);
            }
            return true;
          })
        );
      }

}
