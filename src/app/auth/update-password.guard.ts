import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { UserForToken } from './+state/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class UpdatePasswordGuard implements CanActivate {

  constructor(private authService: AuthService, private store: Store<any>, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const token = route.queryParams.token;
    if (!token) {
       return of(false);
    }

    return this.authService.verifyToken(token, 'PASSWORD_RESET').pipe(
      tap(u => this.store.dispatch(new UserForToken(u, token))),
      map(r => true),
      catchError(e => {
        console.log(e);
        this.router.navigate(['/login']);
        return of(true);
      })
    );
  }
}
