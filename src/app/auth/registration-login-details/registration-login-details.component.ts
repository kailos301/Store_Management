import { UserRegistrationDetails } from '../../api/types/User';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AuthState, RegistrationStatus } from '../+state/auth.reducer';
import { getRegistrationErrorMessage, getRegistrationStatus } from '../+state/auth.selectors';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationService } from '../registration.service';
import { Router } from '@angular/router';
import { RegisterLoginDetails, SocialLogin } from '../+state/auth.actions';
import { ReferenceDataService } from 'src/app/api/reference-data.service';
import { takeUntil } from 'rxjs/operators';
import { LanguageService } from 'src/app/shared/language.service';

@Component({
  selector: 'app-registration-login-details',
  templateUrl: './registration-login-details.component.html',
  styleUrls: ['./registration-login-details.component.scss']
})
export class RegistrationLoginDetailsComponent implements OnInit, OnDestroy {
  newLoginDetails: UserRegistrationDetails;
  status$: Observable<RegistrationStatus>;
  error$: Observable<string>;
  languageId: any;
  private destroy$ = new Subject();

  constructor(
    private store: Store<AuthState>,
    private translate: TranslateService,
    private registrationService: RegistrationService,
    private router: Router,
    private referenceDataService: ReferenceDataService,
    private langLoader: LanguageService) { }

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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  registerAction(userSubmit: UserRegistrationDetails) {
    if (!userSubmit.social) {
      this.store.dispatch(new RegisterLoginDetails(userSubmit));
    } else {
      this.store.dispatch(new SocialLogin(userSubmit.social));
    }
  }

  onLocaleChange($event) {
    this.languageId = $event.id;
    this.translate.use($event.locale);
  }
}
