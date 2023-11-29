import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadOffer } from './+state/stores-catalog.actions';

@Injectable({
    providedIn: 'root'
})
export class StoreOfferGuard implements CanActivate {

    constructor(private stores: Store<any>) { }

    canActivate(route: ActivatedRouteSnapshot) {
        const offerId = route.params.offerId;
        const storeId = route.params.id;
        const catalogId = route.params.catalogId;
        if (offerId !== 'CREATE_OFFER') {
            this.stores.dispatch(new LoadOffer(offerId, storeId, catalogId));
        }
        return true;
    }

}
