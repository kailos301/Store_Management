import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoadCatalog } from '../store-catalog/+state/stores-catalog.actions';
import { LoadOrderingRule, LoadOrderingRules } from './+state/store-ordering-rules.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreOrderingRuleGuard implements CanActivate {
  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.parent.parent.params.id;
    const ruleId = route.params.ruleid;
    if (parseInt(ruleId, 10) > 0) {
      this.store.dispatch(new LoadCatalog(id));
      this.store.dispatch(new LoadOrderingRule(id, ruleId));
    }
    return true;
  }

}
