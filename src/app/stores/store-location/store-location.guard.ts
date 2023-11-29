import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  LoadStoreLocations,
  Initialize,
  InitializeSelectedStoreLocation,
  LoadSelectedStoreLocation
} from './+state/store-location.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreLocationGuard implements CanActivate {

  constructor(private stores: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const storeId = route.params.id;
    const locationId = route.params.locationId;
    this.stores.dispatch(new InitializeSelectedStoreLocation());
    if (locationId !== 'CREATE_LOCATION') {
      this.stores.dispatch(new LoadSelectedStoreLocation(storeId as number, locationId as number));
    }
    return true;
  }

}
