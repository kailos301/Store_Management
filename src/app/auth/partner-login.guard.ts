import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { LoginSuccess } from './+state/auth.actions';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class PartnerLoginGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const token = route.queryParams.partnerToken;
    if (!token) {
       return of(true);
    }

    return this.authService.activatePartner(token).pipe(
      tap(r => this.store.dispatch(new LoginSuccess(r))),
      map(r => true),
      catchError(e => {
        this.router.navigate(['/login']);
        return of(true);
      })
    );
  }
}
