import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalErrorService } from './global-error.service';
import { WindowRefService } from '../window.service';
import { select, Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { getSelectedStore } from '../public/store/+state/stores.selectors';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorGuard implements CanActivate {
  constructor(
    private errorService: GlobalErrorService,
    private router: Router,
    private windowRefSer: WindowRefService,
    private store: Store<any>,
    private authService: AuthService) {}
  canActivate(
    nextRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      this.errorService.outletRouteData = nextRoute;
      if (this.windowRefSer.nativeWindowLocation.hostname.startsWith('admin')) {
        return this.authService.isLoggedIn().pipe(
          map(e => {
            if (e) {
              this.router.navigate(['/manager/expectederror'], { skipLocationChange: true });
              return true;
            } else {
              this.router.navigate(['/login']);
              return false;
            }
          })
        );
      } else {
        // For customer ui do not navigate to not found page, instead load store initial page
        this.router.navigate(['/']);
        return true;
      }
  }

}
