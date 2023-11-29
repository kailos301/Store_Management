import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadStore } from './+state/stores.actions';
import { getLoadingStoreId, getSelectedStoreApiStatus } from './+state/stores.selectors';
import { filter, map, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreDashboardGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;

    return combineLatest([this.store.select(getSelectedStoreApiStatus), this.store.select(getLoadingStoreId)]).pipe(
      filter(([apiStatus]) => apiStatus !== 'LOADING'),
      take(1),
      map(([, loadingStoreId]) => {
        if (+loadingStoreId !== +id) {
          this.store.dispatch(new LoadStore(id));
        }
        return true;
      })
    );
  }

}
