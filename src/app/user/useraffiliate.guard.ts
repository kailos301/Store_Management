import {
  CanActivate,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { GetUserAffiliate } from './+state/user.actions';
import { getUserId } from '../auth/+state/auth.selectors';
import { filter, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserAffiliateGuard implements CanActivate {
  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    return this.store.pipe(
      select(getUserId),
      filter(id => id > 0),
      tap(_ => this.store.dispatch(new GetUserAffiliate())),
      map(_ => true));
  }

}
