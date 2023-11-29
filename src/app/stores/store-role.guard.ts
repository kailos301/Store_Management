import { CanActivate, Router, ActivatedRouteSnapshot, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import {select, Store} from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { getLoggedInUser } from '../auth/+state/auth.selectors';
import { Observable } from 'rxjs';
import { GlobalErrorService } from '../error/global-error.service';

@Injectable({
  providedIn: 'root'
})
export class StoreRoleGuard implements CanActivate, CanActivateChild {

  constructor(private store: Store<any>,
              private router: Router,
              private storeErrorSer: GlobalErrorService) { }

  canActivate(route: ActivatedRouteSnapshot) {
    return this.routeRoleCheck(route.params.id, route.data.rolesAllowed);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot)
                  : boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.routeRoleCheck(childRoute.params.id, childRoute.data.rolesAllowed);
  }

  private routeRoleCheck(storeId: number, rolesAllowed: string[]) {
    return this.store.pipe(
      select(getLoggedInUser),
      filter(loggedInUser => +loggedInUser.id !== -1),
      map(loggedInUser => {

        const selectedStoreId = storeId;

        if (rolesAllowed && !loggedInUser.superAdmin) {
          if (loggedInUser.storeRoles && loggedInUser.storeRoles[selectedStoreId]
              && rolesAllowed.includes(loggedInUser.storeRoles[selectedStoreId])) {
            return true;
          } else {
            this.storeErrorSer.isAccessDenied = true;
            this.router.navigate(['/manager/expectederror'], { skipLocationChange: true });
            return false;
          }
        }
        return true;

      })
    );

  }

}
