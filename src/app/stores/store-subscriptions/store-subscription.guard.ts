import { CanActivate, ActivatedRouteSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { PurchaseSubscriptions } from './+state/store-subscriptions.actions';
import { LoadStore } from '../+state/stores.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreSubscriptionGuard implements CanActivate {

  constructor(private stores: Store<any>) { }


  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    this.stores.dispatch(new PurchaseSubscriptions(id, 'CLOSED'));
    return true;
  }

}
