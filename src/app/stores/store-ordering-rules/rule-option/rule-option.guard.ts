import { take } from 'rxjs/operators';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadOffer } from '../../store-catalog/+state/stores-catalog.actions';

@Injectable({
  providedIn: 'root'
})
export class RuleOptionGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const storeId = route.parent.parent.params.id;
    const optionId = route.params.optid;
    const catalogId = route.queryParams.catalogId;
    if (parseInt(optionId, 10) > 0) {
      this.store.dispatch(new LoadOffer(optionId, storeId, catalogId));
    }
    return true;
  }

}
