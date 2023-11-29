import {
  CanActivate,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadUsers } from './+state/stores.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreUsersGuard implements CanActivate {
  constructor(private stores: Store<any>, private route: ActivatedRoute) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    this.stores.dispatch(new LoadUsers(id, { page: 0, size: 10 }));
    return true;
  }

}
