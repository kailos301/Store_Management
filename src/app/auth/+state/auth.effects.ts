import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import {
  Login,
  AuthActionType,
  LoginSuccess,
  LoginFailed,
  Register,
  RegisterSuccess,
  RegisterFailed,
  VerifyAccount,
  VerifyAccountSuccess,
  VerifyAccountFailed,
  ResetPassword,
  ResetPasswordSuccess,
  ResetPasswordFailed,
  UpdatePassword,
  UpdatePasswordSuccess,
  UpdatePasswordFailed,
  Logout,
  LogoutSuccess,
  LogoutFailed,
  RegisterByInvitation,
  RegisterByInvitationSuccess,
  RegisterByInvitationFailed,
  FetchLoggedInUser,
  FetchLoggedInUserSuccess,
  FetchLoggedInUserFailed,
  PasswordAuth,
  PasswordAuthSuccess,
  PasswordAuthFailed,
  RegisterPartner,
  RegisterPartnerSuccess,
  RegisterPartnerFailed,
  SocialLogin,
  SocialLoginFailed,
  RegisterLoginDetails,
  RegisterPartnerLoginDetails,
  PartnerSocialLogin, InvitationSocialLogin, RegisterByInvitationLoginDetails,
  GetLocationInfo,
  GetLocationInfoSuccess,
  GetLocationInfoFailed,
} from './auth.actions';
import { switchMap, map, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { getPasswordUpdate } from './auth.selectors';
import { ToastrService } from 'ngx-toastr';
import { RegistrationService } from '../registration.service';

@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private store: Store<AuthState>,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private registrationService: RegistrationService) { }

  @Effect()
  login = this.actions$.pipe(
    ofType<Login>(AuthActionType.Login),
    switchMap(action =>
      this.authService.login(action.username, action.password)
      .pipe(
        map(t => new LoginSuccess(t)),
        catchError(a => of(new LoginFailed()))
      ))
  );

  @Effect({dispatch: false})
  loginSuccess = this.actions$.pipe(
    ofType<LoginSuccess>(AuthActionType.LoginSuccess),
    tap(_ => this.router.navigate(['/manager']))
  );

  @Effect()
  socialLogin = this.actions$.pipe(
    ofType<SocialLogin>(AuthActionType.SocialLogin),
    switchMap(action => this.doSocialLogin(action, details => new RegisterLoginDetails(details)))
  );

  @Effect()
  partnerSocialLogin = this.actions$.pipe(
    ofType<PartnerSocialLogin>(AuthActionType.PartnerSocialLogin),
    switchMap(action => this.doSocialLogin(action, details => new RegisterPartnerLoginDetails(details)))
  );

  @Effect()
  invitationSocialLogin = this.actions$.pipe(
    ofType<InvitationSocialLogin>(AuthActionType.InvitationSocialLogin),
    switchMap(action =>
      this.doSocialLogin(action, details => new RegisterByInvitationLoginDetails(details, action.token, action.store)))
  );

  @Effect()
  passwordAuth = this.actions$.pipe(
    ofType<PasswordAuth>(AuthActionType.PasswordAuth),
    switchMap(action =>
      this.authService.login(action.username, action.password)
      .pipe(
        map(t => new PasswordAuthSuccess(t)),
        catchError(a => of(new PasswordAuthFailed()))
      ))
  );
  @Effect({dispatch: false})
  passwordAuthSuccess = this.actions$.pipe(
    ofType<PasswordAuthSuccess>(AuthActionType.PasswordAuthSuccess),
    tap(_ => this.authService.usersPasswordAuth = true)
  );
  @Effect({dispatch: false})
  passwordAuthFailed = this.actions$.pipe(
    ofType<PasswordAuthFailed>(AuthActionType.PasswordAuthFailed),
    tap(_ => this.authService.usersPasswordAuth = false)
  );

  @Effect()
  logout = this.actions$.pipe(
    ofType<Logout>(AuthActionType.Logout),
    switchMap(action =>
      this.authService.logout()
      .pipe(
        map(_ => new LogoutSuccess()),
        catchError(_ => of(new LogoutFailed()))
      )
    )
  );

  @Effect({dispatch: false})
  logoutSuccess = this.actions$.pipe(
    ofType<LogoutSuccess>(AuthActionType.LogoutSuccess),
    tap(_ => this.router.navigate(['/login']))
  );

  @Effect()
  verify = this.actions$.pipe(
    ofType<VerifyAccount>(AuthActionType.VerifyAccount),
    switchMap(action =>
      this.authService.verify(action.email)
      .pipe(
        map(t => new VerifyAccountSuccess()),
        catchError(a => of(new VerifyAccountFailed()))
      ))
  );

  @Effect()
  register = this.actions$.pipe(
    ofType<Register>(AuthActionType.Register),
    switchMap(action =>
      this.authService.register(action.registration)
      .pipe(
        map(t => {
          if (!!action.registration.social) {
            return new SocialLogin(action.registration.social);
          } else {
            return new RegisterSuccess();
          }
        }),
        catchError(e => {
          return of(new RegisterFailed(e.error.errors.map(err => err.message)));
        })
      ))
  );

  @Effect({dispatch: false})
  registerLoginDetails = this.actions$.pipe(
    ofType<RegisterLoginDetails>(AuthActionType.RegisterLoginDetails),
    map(action => this.registrationService.updateRegistrationData(action.registration)),
    tap(_ => this.router.navigate(['/register-user-details']))
  );

  @Effect({dispatch: false})
  registerPartnerLoginDetails = this.actions$.pipe(
    ofType<RegisterPartnerLoginDetails>(AuthActionType.RegisterPartnerLoginDetails),
    map(action => this.registrationService.updatePartnerRegistrationData(action.registration)),
    tap(_ => this.router.navigate(['/register-user-details']))
  );

  @Effect({dispatch: false})
  registerByInvitationLoginDetails = this.actions$.pipe(
    ofType<RegisterByInvitationLoginDetails>(AuthActionType.RegisterByInvitationLoginDetails),
    map(action => this.registrationService.updateRegistrationByInvitationData(action.registration, action.token, action.store)),
    tap(_ => this.router.navigate(['/register-user-details']))
  );

  @Effect({dispatch: false})
  onRegisterSuccess = this.actions$.pipe(
    ofType<RegisterSuccess>(AuthActionType.RegisterSuccess),
    map(_ => this.registrationService.clearData()),
    tap(a => this.router.navigate(['/register/success']))
  );

  @Effect()
  registerByInvitation = this.actions$.pipe(
    ofType<RegisterByInvitation>(AuthActionType.RegisterByInvitation),
    switchMap(action =>
      this.authService.registerByInvitation(action.registration, action.token)
      .pipe(
        map(s => new RegisterByInvitationSuccess(s)),
        catchError(e => {
          return of(new RegisterByInvitationFailed(e.error.errors.map(err => err.message)));
        })
      ))
  );

  @Effect()
  registerByInvitationSuccess = this.actions$.pipe(
    ofType<RegisterByInvitationSuccess>(AuthActionType.RegisterByInvitationSuccess),
    map(a => {
      this.registrationService.clearData();
      return new LoginSuccess(a.loginResponse);
    })
  );

  @Effect({dispatch: false})
  registerByInvitationFailed = this.actions$.pipe(
    ofType<RegisterByInvitationFailed>(AuthActionType.RegisterByInvitationFailed),
    tap(a => a.errors.forEach(e => this.toastr.error(e, this.translateService.instant('admin.store.message.actionFail'))))
  );

  @Effect()
  resetPassword = this.actions$.pipe(
    ofType<ResetPassword>(AuthActionType.ResetPassword),
    switchMap(action =>
      this.authService.resetPassword(action.email)
      .pipe(
        map(t => new ResetPasswordSuccess()),
        catchError(e => {
          const errors = e.error.errors.map(err => err.message);
          if (errors.filter(err => err.includes('User with email'))) {
            return of(new ResetPasswordFailed('User with email does not exist in the system'));
          } else if (e.status === 400) {
            return of(new ResetPasswordFailed(errors.join()));
          }
          return of(new ResetPasswordFailed(this.translateService.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect({dispatch: false})
  onResetPasswordSuccess = this.actions$.pipe(
    ofType<ResetPasswordSuccess>(AuthActionType.ResetPasswordSuccess),
    tap(a => this.router.navigate(['/password/reset/success']))
  );

  @Effect()
  updatePassword = this.actions$.pipe(
    ofType<UpdatePassword>(AuthActionType.UpdatePassword),
    withLatestFrom(this.store.pipe(select(getPasswordUpdate), map(s => s.token))),
    switchMap(([action, token]) =>
      this.authService.updatePassword(action.password, token)
      .pipe(
        map(t => new UpdatePasswordSuccess()),
        catchError(e => {
          if (e.error.status === 400) {
            return of(new UpdatePasswordFailed(e.error.errors[0].message));
          }
          return of(new UpdatePasswordFailed(this.translateService.instant('admin.store.message.errorTryAgain')));
        })
      ))
  );

  @Effect({dispatch: false})
  updatePasswordSuccess = this.actions$.pipe(
    ofType<UpdatePasswordSuccess>(AuthActionType.UpdatePasswordSuccess),
    tap(_ => this.router.navigate(['/login'], {queryParams: {resetPassword: true}}))
  );

  @Effect()
  fetchLoggedInUser = this.actions$.pipe(
    ofType<FetchLoggedInUser>(AuthActionType.FetchLoggedInUser),
    switchMap(action =>
      this.authService.fetchLoggedInUser()
      .pipe(
        map(t => new FetchLoggedInUserSuccess(t)),
        catchError(e => of(new FetchLoggedInUserFailed((!!e.error && !!e.error.errors) ? e.error.errors.map(err => err.message) : '')))
      ))
  );

  @Effect({dispatch: false})
  fetchLoggedInUserSuccess = this.actions$.pipe(
    ofType<FetchLoggedInUserSuccess>(AuthActionType.FetchLoggedInUserSuccess),
    tap(u => {
      if (this.translateService.getLangs().includes(u.loggedInUser.preferredLanguage.locale)) {
        this.translateService.use(u.loggedInUser.preferredLanguage.locale);
      } else {
        this.translateService.use('en');
      }
    })
  );

  @Effect()
  registerPartner = this.actions$.pipe(
    ofType<RegisterPartner>(AuthActionType.RegisterPartner),
    switchMap(action =>
      this.authService.registerPartner(action.registration)
      .pipe(
        map(t => {
          if (!!action.registration.social) {
            return new SocialLogin(action.registration.social);
          } else {
            return new RegisterPartnerSuccess();
          }
        }),
        catchError(e => {
          return of(new RegisterPartnerFailed(e.error.errors.map(err => err.message)));
        })
      ))
  );

  @Effect({dispatch: false})
  registerPartnerSuccess = this.actions$.pipe(
    ofType<RegisterPartnerSuccess>(AuthActionType.RegisterPartnerSuccess),
    map(_ => this.registrationService.clearData()),
    tap(a => this.router.navigate(['/partners/success']))
  );

  @Effect()
  getLocationInfo = this.actions$.pipe(
    ofType<GetLocationInfo>(AuthActionType.GetLocationInfo),
    switchMap(_ =>
      this.authService.getLocationInfo()
      .pipe(
        map(locationInfo => {
          return new GetLocationInfoSuccess(locationInfo);
        }),
        catchError(e => of(new GetLocationInfoFailed((!!e.error && !!e.error.errors) ? e.error.errors.map(err => err.message) : '')))
      ))
  );

  private doSocialLogin(action, redirectUsingDetails) {
    return this.authService.socialLogin(action.login.accessToken, action.login.provider.toLowerCase(), action.login.appleCode)
      .pipe(
        map(t => new LoginSuccess(t)),
        catchError(a => {
          if (a.status === 302) {
            // redirect to registration
            const details = {
              email: action.login.email,
              firstName: action.login.firstName,
              lastName: action.login.lastName,
              social: action.login
            };
            return of(redirectUsingDetails(details));
          }
          return of(new SocialLoginFailed());
        })
      );
  }
}
