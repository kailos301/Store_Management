import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { LoadInvoice, PurchaseSubscription } from '../+state/store-subscriptions.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreInvoiceGuard implements CanActivate {
  constructor(private stores: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const storeId = route.params.id;
    const invoiceId = route.params.invoiceId;
    const userType: Observable<boolean> = this.stores.pipe(select(getLoggedInUser), filter(loggedInUser => loggedInUser.id !== -1),
      map(s => s.superAdmin));
    if (userType && +invoiceId > 0) {
      this.stores.dispatch(new LoadInvoice(storeId, invoiceId));
    }
    return userType;
  }

}
