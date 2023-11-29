import { Component, OnInit } from '@angular/core';
import { UserRegistrationDetails } from 'src/app/api/types/User';
import { Observable } from 'rxjs';
import { AuthState, RegistrationStatus } from '../+state/auth.reducer';
import { select, Store } from '@ngrx/store';
import { getRegistrationErrorMessage, getRegistrationStatus } from '../+state/auth.selectors';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationService } from '../registration.service';
import { Router } from '@angular/router';
import { PartnerSocialLogin, RegisterPartnerLoginDetails } from '../+state/auth.actions';

@Component({
  selector: 'app-partner-registration',
  templateUrl: './partner-registration.component.html',
  styleUrls: ['./partner-registration.component.scss']
})
export class PartnerRegistrationComponent implements OnInit {

  newLoginDetails: UserRegistrationDetails;
  status$: Observable<RegistrationStatus>;
  error$: Observable<string>;
  storeId: any;
  languageId: any;
  constructor(
    private store: Store<AuthState>,
    private translate: TranslateService,
    private registrationService: RegistrationService,
    private router: Router) { }

  ngOnInit() {
    this.newLoginDetails = {
      email: this.registrationService.data ? this.registrationService.data.email : '',
      password: ''
    };

    this.status$ = this.store.pipe(
      select(getRegistrationStatus)
    );

    this.error$ = this.store.pipe(
      select(getRegistrationErrorMessage)
    );
  }

  registerAction(userRegistrationDetails: UserRegistrationDetails) {
    if (!userRegistrationDetails.social) {
      this.store.dispatch(new RegisterPartnerLoginDetails(userRegistrationDetails));
    } else {
      this.store.dispatch(new PartnerSocialLogin(userRegistrationDetails.social));
    }
  }

  onLocaleChange($event) {
    this.languageId = $event.id;
    this.translate.use($event.locale);
  }
}
