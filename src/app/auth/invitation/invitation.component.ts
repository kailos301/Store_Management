import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserRegistrationDetails } from 'src/app/api/types/User';
import { Observable, Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AuthState, RegistrationStatus } from '../+state/auth.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { getRegistrationByInvitationErrorMessage, getRegistrationByInvitationStatus } from '../+state/auth.selectors';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationService } from '../registration.service';
import { InvitationSocialLogin, RegisterByInvitationLoginDetails } from '../+state/auth.actions';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit, OnDestroy {

  newLoginDetails: UserRegistrationDetails;
  status$: Observable<RegistrationStatus>;
  error$: Observable<string>;
  languageId: any;
  mode = 'INVITE';
  private destroy$ = new Subject();

  constructor(
    private store: Store<AuthState>,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private registrationService: RegistrationService,
    private router: Router) { }

  ngOnInit() {
    this.newLoginDetails = {
      email: this.registrationService.data ? this.registrationService.data.email : this.route.snapshot.queryParams.email,
      password: ''
    };
    this.status$ = this.store.pipe(
      select(getRegistrationByInvitationStatus)
    );

    this.error$ = this.store.pipe(
      select(getRegistrationByInvitationErrorMessage)
    );
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  registerByInvitationAction(invUser: UserRegistrationDetails) {
    if (!this.languageId || this.languageId <= 0) {
      return;
    }

    const token = this.route.snapshot.queryParams.token;
    const store = this.route.snapshot.queryParams.store;

    if (!invUser.social) {
      this.store.dispatch(new RegisterByInvitationLoginDetails(invUser, token, store));
    } else {
      this.store.dispatch(new InvitationSocialLogin(invUser.social, token, store));
    }
  }
  onLocaleChange($event) {
    this.languageId = $event.id;
    this.translate.use($event.locale);
  }
}
