import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoadDiscountVoucher } from '../+state/store-discountvoucher.actions';

@Injectable({
  providedIn: 'root'
})
export class DiscountvoucherFormGuard implements CanActivate {
  constructor(private store: Store<any>) { }
  canActivate(
    next: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const voucherId: number = next.params.voucherId;
    const storeId: number = next.parent.parent.params.id;
    if (voucherId > 0) {
      this.store.dispatch(new LoadDiscountVoucher(storeId, voucherId));
    }
    return true;
  }

}
