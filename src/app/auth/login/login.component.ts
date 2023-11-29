import { Router, ActivatedRoute } from '@angular/router';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AuthState } from '../+state/auth.reducer';
import {Login, ResetPasswordInitial, SocialLogin, SocialLoginFailed} from '../+state/auth.actions';
import { Observable } from 'rxjs';
import {getInvalidCredentials, getSocialAccountLoginFailed} from '../+state/auth.selectors';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import {SocialAuthService, FacebookLoginProvider, GoogleLoginProvider} from 'angularx-social-login';
import {RegistrationService} from '../registration.service';
import { SocialAccountLoginDetails } from 'src/app/api/types/User';
import { environment as envConst } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

declare var AppleID: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  invalidCredentials$: Observable<boolean>;
  socialAccountLoginFailed$: Observable<boolean>;
  userVerified = false;
  userPasswordReset = false;
  emailUpdated = false;
  userInvited = false;
  partnerVerified = false;
  storeName = '';
  jwtHelper = new JwtHelperService();

  constructor(
    private fb: FormBuilder,
    private store: Store<AuthState>,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: any,
    private translate: TranslateService,
    private authService: SocialAuthService,
    private registrationService: RegistrationService) { }


  ngOnInit() {

    this.loginForm = this.fb.group({
      username: ['', Validators.compose([Validators.required, Validators.maxLength(254)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])]
    });

    this.invalidCredentials$ = this.store.pipe(
      select(getInvalidCredentials)
    );

    this.socialAccountLoginFailed$ = this.store.pipe(
      select(getSocialAccountLoginFailed)
    );

    this.userVerified = this.route.snapshot.queryParams.token;
    this.userPasswordReset = this.route.snapshot.queryParams.resetPassword;
    this.emailUpdated = this.route.snapshot.queryParams.emailUpdated;
    this.userInvited = this.route.snapshot.queryParams.userInvited;
    this.storeName = this.route.snapshot.queryParams.storeName;
    this.partnerVerified = this.route.snapshot.queryParams.partnerVerified;

    this.document.documentElement.lang = 'en';
  }

  loginAction() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      this.store.dispatch(new Login(this.username.value, this.password.value));
    }
  }

  socialLoginAction(authProvider: string) {
    const provider = authProvider === 'google' ? GoogleLoginProvider.PROVIDER_ID : FacebookLoginProvider.PROVIDER_ID;
    this.authService.signIn(provider)
    .then(user => {
      const socialAccountDetails: SocialAccountLoginDetails = {
        provider,
        accessToken: user.authToken,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
      this.store.dispatch(new SocialLogin(socialAccountDetails));
    })
    .catch(e => {
      console.log(e);
    });
  }

  async signInWithApple() {

    AppleID.auth.init({
      clientId: envConst.appleClientId,
      scope: 'name email',
      redirectURI: window.location.href,
      state: 'origin:web',
      usePopup: true,
    });

    let response;
    try {
      response = await AppleID.auth.signIn();
    } catch (err) {
      console.error(err);
      this.store.dispatch(new SocialLoginFailed());
    }
    console.log(response);
    if (response && response.authorization && response.authorization.state === 'origin:web'
        && response.authorization.id_token && response.authorization.code) {
      const appleToken = this.jwtHelper.decodeToken(response.authorization.id_token);
      const userName = (response.user) ? response.user : {};
      const socialAccountDetails: SocialAccountLoginDetails = {
        provider: 'apple',
        accessToken: response.authorization.id_token,
        appleCode: response.authorization.code,
        email: appleToken.email,
        firstName: userName?.name?.firstName,
        lastName: userName?.name?.lastName
      };
      this.store.dispatch(new SocialLogin(socialAccountDetails));
    } else if (response && response.error) {
      console.error(response.error);
      this.store.dispatch(new SocialLoginFailed());
    }
  }

  onLocaleChange($event) {
    this.translate.use($event.locale);
  }
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  goToRegistration() {
    this.registrationService.clearData();
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.store.dispatch(new ResetPasswordInitial());
    this.router.navigate(['/password/reset']);
  }

  get storeNameTraslationToken() {
    return { storeName: this.storeName };
  }
}
