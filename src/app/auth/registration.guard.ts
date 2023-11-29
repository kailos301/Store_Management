import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { InitializeRegistrationState, GetLocationInfo } from './+state/auth.actions';
import { RegistrationService } from './registration.service';

@Injectable({
  providedIn: 'root'
})
export class RegistrationGuard implements CanActivate {

  constructor(
    private store: Store<any>,
    private registrationService: RegistrationService) { }

  canActivate() {
    if (!this.registrationService.data) {
      this.store.dispatch(new InitializeRegistrationState());
      this.store.dispatch(new GetLocationInfo());
    }
    return true;
  }
}
