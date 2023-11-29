import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { filter, tap, map, take } from 'rxjs/operators';
import { LoadUsers, SearchUser } from './+state/users.actions';
import { getUsersList } from './+state/users.selectors';

@Injectable({
  providedIn: 'root'
})
export class UsersListGuard implements CanActivate {
  constructor(private store: Store<any>) { }

  canActivate() {
    this.store.pipe(
      take(1),
      select(getUsersList),
      // filter(users => users.status === 'INITIAL' || users.status === 'FAILED'),
      map(users => {
        if (users.status === 'INITIAL' || users.status === 'FAILED') {
          this.store.dispatch(new LoadUsers({ page: 0, size: 10 }));
        } else {
          if (users.paging.size !== -1) {
            this.store.dispatch(new LoadUsers(users.paging));
          } else {
            if (users.data && users.data[0] && users.data[0].email) {
              this.store.dispatch(new SearchUser(users.data[0].email));
            } else {
              this.store.dispatch(new LoadUsers({ page: 0, size: 10 }));
            }
          }
        }
      })
    ).subscribe();
    return true;
  }
}
