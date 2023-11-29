import { GetUser } from './+state/account.actions';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { AccountState } from './+state/account.reducer';

@Injectable()
export class UserGuard implements CanActivate {

  constructor(private store: Store<AccountState>) { }

  canActivate() {
    this.store.dispatch(new GetUser());
    return true;
  }
}
