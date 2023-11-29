import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoadOrderingRules } from './+state/store-ordering-rules.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreOrderingRulesGuard implements CanActivate {
  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.parent.parent.params.id;
    this.store.dispatch(new LoadOrderingRules(id));
    return true;
  }

}
