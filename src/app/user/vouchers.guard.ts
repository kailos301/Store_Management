import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { LoadVouchers } from './+state/user.actions';
import { filter, tap, map } from 'rxjs/operators';
import { getUserId } from '../auth/+state/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class VouchersGuard implements CanActivate {
  constructor(private store: Store<any>) { }

  canActivate() {
    return this.store.pipe(
      select(getUserId),
      filter(id => id > 0),
      tap(_ => this.store.dispatch(new LoadVouchers({ page: 0, size: 10 }))),
      map(_ => true));
  }

}
