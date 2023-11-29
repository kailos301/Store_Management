import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { GetUser } from 'src/app/account/+state/account.actions';
import { map } from 'rxjs/operators';
import { getProfile } from 'src/app/account/+state/account.selectors';

@Injectable({
  providedIn: 'root'
})
export class StorePaymentMethodsGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate() {
    return this.store.pipe(
      select(getProfile),
      map(userProfile => {
        if (!userProfile || !userProfile.country || !userProfile.country.code) {
          this.store.dispatch(new GetUser());
        }
        return true;
      }));
  }
}
