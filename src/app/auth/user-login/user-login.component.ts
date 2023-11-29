import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SocialAuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { LogService } from 'src/app/shared/logging/LogService';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: any,
    private translate: TranslateService,
    private authService: SocialAuthService,
    private logger: LogService) { }

  ngOnInit() {
    this.document.documentElement.lang = 'en';

    window.addEventListener('message', (event) => {
      const {data} = event;
      if (data.logout !== null && data.logout !== undefined) {
        if (data.logout === true) {
          this.logout();
        }
      }
    }, false);
  }

  socialLoginAction(authProvider: string) {
    const provider = authProvider === 'google' ? GoogleLoginProvider.PROVIDER_ID : FacebookLoginProvider.PROVIDER_ID;
    this.authService.signIn(provider)
      .then(user => {
        user.provider = provider;
        window.parent.postMessage(user, document.referrer);
      })
      .catch(e => {
        this.logger.error(`onSocialLogin error during sign-in with provider ${provider}`, e);
      });
  }

  onLocaleChange($event) {
    this.translate.use($event.locale);
  }

  logout() {
    this.authService.signOut(false)
      .then(() => console.log('Logged out Successfully !!'))
      .catch((err) => console.error(err));
  }
}
