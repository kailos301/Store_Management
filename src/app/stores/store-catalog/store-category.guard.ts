import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadCategory } from './+state/stores-catalog.actions';

@Injectable({
    providedIn: 'root'
})
export class StoreCategoryGuard implements CanActivate {

    constructor(private stores: Store<any>) { }

    canActivate(route: ActivatedRouteSnapshot) {
        const categoryId = route.params.categoryId;
        const storeId = route.params.id;
        const catalogId = route.params.catalogId;
        if (categoryId !== 'CREATE_CATEGORY') {
            this.stores.dispatch(new LoadCategory(categoryId, storeId, catalogId));
        }
        return true;
    }

}
