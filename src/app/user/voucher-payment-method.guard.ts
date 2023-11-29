import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, map, tap } from 'rxjs/operators';
import {getProfile} from '../account/+state/account.selectors';
import {GetVoucherPaymentMethod} from './+state/user.actions';

@Injectable({
  providedIn: 'root'
})
export class VoucherPaymentMethodGuard implements CanActivate {
  constructor(private store: Store<any>) { }

  canActivate() {

    return this.store.pipe(
      select(getProfile),
      filter(l => l.email !== ''),
      tap(s =>  this.store.dispatch(new GetVoucherPaymentMethod(s.country.code))),
      map(l => true)
    );
  }
}
