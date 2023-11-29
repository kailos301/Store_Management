import { SocialAccountLoginDetails, UserProfile, UserRegistrationDetails } from '../../api/types/User';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AuthState, RegistrationStatus } from '../+state/auth.reducer';
import { AuthActionType, Register, RegisterByInvitation, RegisterPartner } from '../+state/auth.actions';
import { getRegistrationErrorMessage, getRegistrationStatus } from '../+state/auth.selectors';
import { TranslateService } from '@ngx-translate/core';
import { GeoLocation } from 'src/app/shared/geolocation';
import { RegistrationService } from '../registration.service';
import { Router } from '@angular/router';

// tslint:disable-next-line
const _hsq = window['_hsq'] = window['_hsq'] || [];

@Component({
  selector: 'app-registration-user-details',
  templateUrl: './registration-user-details.component.html',
  styleUrls: ['./registration-user-details.component.scss']
})

export class RegistrationUserDetailsComponent implements OnInit, OnDestroy {
  newUser: UserProfile;
  socialAccount: SocialAccountLoginDetails;
  status$: Observable<RegistrationStatus>;
  error$: Observable<string>;
  languageId: any;
  isNewRegisterUser = false;
  private destroy$ = new Subject();

  constructor(
    private store: Store<AuthState>,
    private translate: TranslateService,
    private registrationService: RegistrationService,
    private router: Router) { }

  ngOnInit() {
    if (!this.registrationService.data) {
      this.router.navigate(['/register']);
    }
    const registrationDetails = this.registrationService.data || {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    };
    this.isNewRegisterUser = this.registrationService.action === AuthActionType.Register ? true : false;
    let countryCode;
    try {
      countryCode = GeoLocation.getCountryCode();
    } catch (err) {
      console.log(err);
      countryCode = 'UK';
    }
    this.newUser = {
      email: registrationDetails.email,
      firstName: registrationDetails.firstName,
      lastName: registrationDetails.lastName,
      phoneNumber: '',
      password: registrationDetails.password,
      countryId: countryCode,
      preferredLanguageId: 0
    };

    this.socialAccount = registrationDetails.social;

    this.status$ = this.store.pipe(
      select(getRegistrationStatus)
    );

    this.error$ = this.store.pipe(
      select(getRegistrationErrorMessage)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  registerAction(userSubmit: UserRegistrationDetails) {
    if (!this.languageId || this.languageId <= 0) {
      return;
    }
    userSubmit.preferredLanguageId = this.languageId;

    if (typeof _hsq !== 'undefined') {
      _hsq.push(['setPath', '/register']);
      _hsq.push(['identify', {
          email: userSubmit.email,
          firstname: userSubmit.firstName,
          lastname: userSubmit.lastName,
          phone: userSubmit.phoneNumber
      }]);
      _hsq.push(['trackPageView']);
    }


    let action;
    if (this.registrationService.action === AuthActionType.RegisterPartner) {
      action = new RegisterPartner(userSubmit);
    } else if (this.registrationService.action === AuthActionType.RegisterByInvitation) {
      const { token, store } = this.registrationService.metadata;
      action = new RegisterByInvitation(userSubmit, token, store);
    } else {
      action = new Register(userSubmit);
    }
    this.store.dispatch(action);
  }

  onLocaleChange($event) {
    this.languageId = $event.id;
    this.newUser.preferredLanguageId = $event.id;
    this.translate.use($event.locale);
  }
}
