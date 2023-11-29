import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { UserRegistrationDetails } from 'src/app/api/types/User';
import {SocialAuthService, FacebookLoginProvider, GoogleLoginProvider} from 'angularx-social-login';
import { environment as envConst } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RegistrationService } from '../registration.service';

declare var AppleID: any;

@Component({
  selector: 'app-registration-login-details-form',
  templateUrl: './registration-login-details-form.component.html',
  styleUrls: ['./registration-login-details-form.component.scss']
})

export class RegistrationLoginDetailsFormComponent implements OnInit , OnDestroy {

  @Input() newLoginDetails: UserRegistrationDetails;
  @Input() mode = '';
  @Input() languageId: any;
  @Output() submitEvent = new EventEmitter<UserRegistrationDetails>();
  @Input() registration = false;
  registerForm: FormGroup;
  private destroy$ = new Subject();
  hide = true;
  jwtHelper = new JwtHelperService();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: SocialAuthService,
    private registrationService: RegistrationService) {
    }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: [
        {
          value: this.newLoginDetails.email, disabled: this.mode === 'INVITE'
        },
        Validators.compose([CustomValidators.required, CustomValidators.email, Validators.maxLength(254)])
      ],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
    }, {validator: CustomValidators.matchFieldsValidator('confirmPassword', 'password')});
    this.registrationService.addHubspotScriptForAdminRegisterPage();
  }


  goToLogin() {
    this.router.navigate(['/login']);
  }

  registerFormAction() {
    if (this.registerForm.invalid) {
      this.registerForm.get('email').markAsTouched();
      this.registerForm.get('password').markAsTouched();
      this.registerForm.get('confirmPassword').markAsTouched();
    }
    else {
      const userRegistrationDetails: {
        email,
        password
      } = Object.assign({}, this.registerForm.getRawValue());

      const userSubmit: UserRegistrationDetails = {
        email: userRegistrationDetails.email,
        password: userRegistrationDetails.password,
        social: undefined
      };

      this.submitEvent.emit(userSubmit);
    }
  }

  socialRegistrationAction(provider: string) {
    const authProvider = provider === 'google' ? GoogleLoginProvider.PROVIDER_ID : FacebookLoginProvider.PROVIDER_ID;
    this.authService.signIn(authProvider)
      .then(user => {
        const userSubmit: UserRegistrationDetails = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: undefined,
          social: {
            provider,
            accessToken: user.authToken,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        };
        this.submitEvent.emit(userSubmit);
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
    }
    console.log(response);
    if (response && response.authorization && response.authorization.state === 'origin:web'
        && response.authorization.id_token && response.authorization.code) {
      const appleToken = this.jwtHelper.decodeToken(response.authorization.id_token);
      const userName = (response.user) ? response.user : {};
      const userSubmit: UserRegistrationDetails = {
        email: appleToken.email,
        firstName: userName?.name?.firstName,
        lastName: userName?.name?.lastName,
        password: undefined,
        social: {
          provider: 'apple',
          accessToken: response.authorization.id_token,
          appleCode: response.authorization.code,
          email: appleToken.email,
          firstName: userName?.name?.firstName,
          lastName: userName?.name?.lastName
        }
      };
      this.submitEvent.emit(userSubmit);
    }
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  ngOnDestroy() {
    this.registrationService.removeHubspotScriptForAdminRegisterPage();
  }
}
