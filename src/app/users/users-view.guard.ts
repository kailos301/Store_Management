import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import {LoadUser} from './+state/users.actions';
import { getLoadingUserId, getSelectedUserApiStatus } from './+state/users.selectors';

@Injectable({
  providedIn: 'root'
})
export class UsersViewGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;

    return combineLatest([this.store.select(getSelectedUserApiStatus), this.store.select(getLoadingUserId)]).pipe(
      filter(([apiStatus, loadingUserId]) => apiStatus !== 'LOADING' || loadingUserId === -1),
      take(1),
      map(([apiStatus, loadingUserId]) => {
        if (loadingUserId !== +id) {
          this.store.dispatch(new LoadUser(id));
        }
        return true;
      })
    );
  }
}
