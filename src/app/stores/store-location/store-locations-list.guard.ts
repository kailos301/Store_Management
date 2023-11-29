import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadStoreLocations, Initialize } from './+state/store-location.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreLocationsListGuard implements CanActivate {

  constructor(private stores: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    this.stores.dispatch(new Initialize());
    this.stores.dispatch(new LoadStoreLocations(id, { page: 0, size: 24 }));
    return true;
  }

}
