import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadStoreOrder } from '../+state/store-order.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreOrderGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    const orderUuid = route.params.orderUuid;
    this.store.dispatch(new LoadStoreOrder(id, orderUuid));

    return true;
  }

}
