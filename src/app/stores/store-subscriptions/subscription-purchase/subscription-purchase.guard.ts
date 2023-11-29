import { CanActivate, ActivatedRouteSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { PurchaseSubscription } from '../+state/store-subscriptions.actions';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPurchaseGuard implements CanActivate {

  constructor(private stores: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    this.stores.dispatch(new PurchaseSubscription(id));
    return true;
  }

}
