import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadZone } from '../+state/stores.actions';

@Injectable({
    providedIn: 'root'
})
export class StoreZoneViewGuard implements CanActivate {
    constructor(private store: Store<any>) { }

    canActivate(route: ActivatedRouteSnapshot) {
        const storeId = window.location.href.split('/')[5];
        const zoneid = route.params.zoneid;
        if (+storeId > 0 && +zoneid > 0) {
            this.store.dispatch(new LoadZone(+storeId, +zoneid));
        }
        return true;
    }

}
