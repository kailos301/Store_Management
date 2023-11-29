import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, first, flatMap, map, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AuthState } from './+state/auth.reducer';
import { getTokens } from './+state/auth.selectors';
import { RefreshTokenSuccess, LogoutSuccess } from './+state/auth.actions';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(public authService: AuthService, private router: Router, private store: Store<AuthState>) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const authEndpoint = /api\/v1\/auth/gi;

    const authEndpoints = [
      '/api/v1/auth/logout',
      '/api/v1/auth/profile',
      '/api/v1/auth/profile/password/update',
      '/api/v1/auth/profile/password/create',
      '/api/v1/auth/profile/social/google/link',
      '/api/v1/auth/profile/social/facebook/link',
      '/api/v1/auth/currentuser'
    ];

    return this.store.select(getTokens).pipe(
      first(),
      mergeMap(tokens => {
        if (authEndpoints.includes(request.url) || request.url.search(authEndpoint) === -1 ) {
          if (!!tokens && !!tokens.jwt) {
            request = this.addToken(request, tokens.jwt);
          }
          return next.handle(request).pipe(catchError(error => {
            if (!error.errors) { error.errors = []; }
            if (!!error.error && !error.error.errors) { error.error.errors = []; }
            if (error instanceof HttpErrorResponse && error.status === 401) {
              return this.handle401Error(request, next);
            } else {
              return throwError(error);
            }
          }));
        } else {
          return next.handle(request);
        }
      }
    ));

  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.authService.isRefreshingToken) {
      this.authService.isRefreshingToken = true;
      this.refreshTokenSubject.next(null);

      return this.store.select(getTokens).pipe(
        first(),
        mergeMap(tokens => {
          if (!!tokens.refreshToken) {
            return this.authService.refreshToken(tokens.refreshToken).pipe(
              switchMap((token: any) => {
                this.authService.isRefreshingToken = false;
                this.refreshTokenSubject.next(token.jwt);
                this.store.dispatch(new RefreshTokenSuccess(token));
                return next.handle(this.addToken(request, token.jwt));
              }),
              catchError(error => {
                if (!error.errors) { error.errors = []; }
                if (!!error.error && !error.error.errors) { error.error.errors = []; }
                this.authService.isRefreshingToken = false;
                if (error instanceof HttpErrorResponse && error.status === 401) {
                  this.store.dispatch(new LogoutSuccess());
                  this.router.navigate(['/login']);
                }
                return throwError(error);
              }));
          } else {
              this.authService.isRefreshingToken = false;
              this.store.dispatch(new LogoutSuccess());
              this.router.navigate(['/login']);
          }

        }));
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }
}
