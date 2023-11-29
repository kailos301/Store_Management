import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadCatalog } from './+state/stores-catalog.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreCatalogGuard implements CanActivate {

    constructor(private stores: Store<any>) {}

    canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    this.stores.dispatch(new LoadCatalog(id));
    return true;
    }

}
