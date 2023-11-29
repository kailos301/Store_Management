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
export class LoginGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const token = route.queryParams.token;
    if (!token) {
       return of(true);
    }

    return this.authService.activate(token).pipe(
      tap(r => this.store.dispatch(new LoginSuccess(r))),
      map(r => true),
      catchError(e => {
        this.router.navigate(['/account/verification']);
        return of(true);
      })
    );
  }
}
