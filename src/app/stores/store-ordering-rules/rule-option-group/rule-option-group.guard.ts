import { take } from 'rxjs/operators';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadCatalog, LoadCategory } from '../../store-catalog/+state/stores-catalog.actions';

@Injectable({
  providedIn: 'root'
})
export class RuleOptionGroupGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const storeId = route.parent.parent.params.id;
    const categoryId = route.params.rogid;
    const catalogId = route.queryParams.catalogId;
    if (parseInt(categoryId, 10) > 0) {
      this.store.dispatch(new LoadCategory(categoryId, storeId, catalogId));
    }
    return true;
  }

}
