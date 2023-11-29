import {UserProfile, UserRegistrationDetails} from './../api/types/User';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable, Subject } from 'rxjs';
import { catchError, mapTo, tap, first, flatMap, map } from 'rxjs/operators';
import { Tokens, LoginResponse, LoggedInUser } from './auth';
import { Store } from '@ngrx/store';
import { AuthState } from './+state/auth.reducer';
import { getTokens } from './+state/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isRefreshToken = false;
  private passwordAuthUsers = false;
  private passwordAuthSub = new Subject<any>();
  constructor(private http: HttpClient, private store: Store<AuthState>) { }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/login', {username, password});
  }

  socialLogin(accessToken: string, authProvider: string, appleCode: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`/api/v1/auth/login/${authProvider}`, {accessToken, appleCode});
  }

  register(data: UserRegistrationDetails): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/register', data);
  }

  registerPartner(data: UserRegistrationDetails): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/register/partner', data);
  }

  registerByInvitation(data: UserRegistrationDetails, token: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/register/invitation', {...data, token});
  }

  verify(email: string): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/email/verify', email);
  }

  activate(token: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/email/activate', token);
  }

  activatePartner(token: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/partner/activate', token);
  }

  resetPassword(email: string): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/password/reset', email);
  }

  verifyToken(token: string, type: string): Observable<string> {
    return this.http.get<string>(`/api/v1/auth/token/verify?token=${token}&type=${type}`, {responseType: 'text' as 'json'});
  }

  updatePassword(password: string, token: string): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/password/update', {password, token});
  }

  logout() {
    return this.http.post<any>('/api/v1/auth/logout', {});
  }

  isLoggedIn(): Observable<boolean> {
    return this.store.select(getTokens).pipe(first(), map(tokens => !!tokens.jwt));
  }

  refreshToken(refreshToken: string) {
    return this.http.post<any>('/api/v1/auth/token/refresh', refreshToken);
  }

  get isRefreshingToken() {
    return this.isRefreshToken;
  }
  set isRefreshingToken(isrefreshToken: boolean) {
    this.isRefreshToken = isrefreshToken;
  }

  get usersPasswordAuth() {
    return this.passwordAuthUsers;
  }
  set usersPasswordAuth(passAuth: boolean) {
    this.passwordAuthUsers = passAuth;
    this.passwordAuthSub.next(this.passwordAuthUsers);
  }
  getPasswordAuth(): Observable<any> {
    return this.passwordAuthSub.asObservable();
  }
  fetchLoggedInUser(): Observable<LoggedInUser> {
    return this.http.get<LoggedInUser>('/api/v1/auth/currentuser');
  }
  getLocationInfo(): Observable<any> {
    return this.http.get<any>('https://freeipapi.com/api/json');
  }
}
