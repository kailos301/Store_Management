import { LocationService } from 'src/app/public/location.service';
import { CookieService } from 'ngx-cookie-service';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { WINDOW } from './window-providers';

@Injectable()
export class BasketEnabledGuard implements CanActivate {

  subdomain: string;
  constructor(private cookieService: CookieService,
              private locationService: LocationService,
              @Inject(WINDOW) private window: Window) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const storeAlias = this.getSubdomain();
    if (storeAlias !== 'admin') {


      // Set basket enabled based on url param
      // Does it only if value not set or has changed from previous value
      const basketEnabled = route.queryParams.basket;

      if (basketEnabled !== undefined) {
        if (!this.cookiesEnabled
          && (this.locationService.isBasketEnabled() === null || this.locationService.isBasketEnabled() !== basketEnabled)) {
          this.locationService.setBasketEnabled(basketEnabled);
        } else if (this.cookiesEnabled
          && (!this.cookieService.check('basketEnabled') || !!this.cookieService.get('basketEnabled') !== basketEnabled)) {
          this.cookieService.set('basketEnabled', basketEnabled, 1);
        }
      }

    }

    return true;
  }

  getSubdomain(): string {
    const domain = this.window.location.hostname;
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
