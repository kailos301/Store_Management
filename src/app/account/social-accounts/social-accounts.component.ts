import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SocialAuthService, GoogleLoginProvider, FacebookLoginProvider} from 'angularx-social-login';
import {select, Store} from '@ngrx/store';
import {SocialAccount, UserProfile} from '../../api/types/User';
import {getProfile} from '../+state/account.selectors';
import {LinkSocialAccount} from '../+state/account.actions';
import {Observable} from 'rxjs';
import {AccountState} from '../+state/account.reducer';
import { environment as envConst } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

declare var AppleID: any;

@Component({
  selector: 'app-social-accounts',
  templateUrl: './social-accounts.component.html',
  styleUrls: ['./social-accounts.component.scss']
})
export class SocialAccountsComponent implements OnInit, OnChanges {
  profile$: Observable<UserProfile>;
  jwtHelper = new JwtHelperService();

  constructor(private authService: SocialAuthService, private store: Store<AccountState>) {}

  ngOnInit() {
    this.profile$ = this.store.pipe(
      select(getProfile)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  linkSocialAccount(authProvider: string): void {
    const provider = authProvider === 'google' ? GoogleLoginProvider.PROVIDER_ID : FacebookLoginProvider.PROVIDER_ID;
    this.authService.signIn(provider)
      .then(user => {
        this.store.dispatch(new LinkSocialAccount(user.authToken, authProvider));
      })
      .catch(e => {
        console.log(e);
      });
  }

  async linkWithApple() {

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
      this.store.dispatch(new LinkSocialAccount(response.authorization.id_token, 'apple', response.authorization.code));
    } else if (response && response.error) {
      console.error(response.error);
    }
  }

  hasGoogleAccount(user: UserProfile): boolean {
    return !!(user && user.googleAccount);
  }

  hasFacebookAccount(user: UserProfile): boolean {
    return !!(user && user.facebookAccount);
  }

  hasAppleAccount(user: UserProfile): boolean {
    return !!(user && user.appleAccount);
  }

  socialAccountButtonText(account: SocialAccount): string {
    return `${account.firstName} ${account.lastName ? account.lastName : ''} (${account.email})`;
  }
}
