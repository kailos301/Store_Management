import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, map, tap } from 'rxjs/operators';
import { getSelectedStore } from '../+state/stores.selectors';
import { LoadZones, GetStatusOfZone } from '../+state/stores.actions';

@Injectable({
    providedIn: 'root'
})
export class StoreAddressDeliveryGuard implements CanActivate {
    constructor(private store: Store<any>) { }

    canActivate() {
        return this.store.pipe(
            select(getSelectedStore),
            filter(l => l.id > 0),
            tap(_ => this.store.dispatch(new LoadZones())),
            tap(_ => this.store.dispatch(new GetStatusOfZone())),
            map(_ => true));
    }

}
