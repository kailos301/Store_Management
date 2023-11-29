import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Store } from '@ngrx/store';
import { InitCookieMessage, InitializeCartState, LoadStore } from './store/+state/stores.actions';
import { WINDOW } from './window-providers';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StoreLoadingGuard implements CanActivate {

  subdomain: string;
  constructor(private cookieService: CookieService,
              private store: Store<any>,
              @Inject(WINDOW) private window: Window,
              private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot) {
    // if we want to use /:store-alias then uncomment next line
    // const storeAlias = route.params['store-alias'];
    const storeAlias = this.getSubdomain();
    if (storeAlias === '' || storeAlias === 'admin') {
      this.router.navigateByUrl('/manager');
    } else {
      this.store.dispatch(new InitializeCartState());
      this.store.dispatch(new LoadStore(storeAlias));

      if (this.cookiesEnabled()) {
        const cookieEnabled = this.cookieService.get('cookieEnabled');
        if (cookieEnabled && (cookieEnabled === 'ACCEPT' || cookieEnabled === 'REJECT')) {
          this.store.dispatch(new InitCookieMessage(cookieEnabled));
          return true;
        }
      }
      this.store.dispatch(new InitCookieMessage('UNSET'));
      return true;
    }
  }

  getSubdomain(): string {
    const domain = this.window.location.hostname;

    if (domain.indexOf(environment.envDomain) < 0) {
      return domain;
    }

    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      return '';
    }
    return domain.split('.')[0];
  }

  cookiesEnabled() {
    let cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
    }
    return (cookieEnabled);
  }
}
