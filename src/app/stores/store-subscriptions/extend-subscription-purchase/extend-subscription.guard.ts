import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class ExtendSubscriptionGuard implements CanActivate {
  constructor(private stores: Store<any>) { }

  canActivate() {
    return this.stores.pipe(select(getLoggedInUser), filter(loggedInUser => +loggedInUser.id !== -1),
      map(s => s.superAdmin));
  }

}
