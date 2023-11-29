import { Injectable } from '@angular/core';
import { UserRegistrationDetails } from '../api/types/User';
import { AuthActionType } from './+state/auth.actions';
import { environment as envConst } from 'src/environments/environment';

export interface RegistrationMetadata {
  token: string;
  store: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  private loginDetails: UserRegistrationDetails;
  private finalAction: AuthActionType;
  private registrationMetadata: RegistrationMetadata;

  constructor() { }

  updateRegistrationData(loginDetails: UserRegistrationDetails) {
    this.updateData(loginDetails, AuthActionType.Register);
  }

  updatePartnerRegistrationData(loginDetails: UserRegistrationDetails) {
    this.updateData(loginDetails, AuthActionType.RegisterPartner);
  }

  updateRegistrationByInvitationData(loginDetails: UserRegistrationDetails, token: string, store: string) {
    const metadata: RegistrationMetadata = {
      token,
      store
    };
    this.updateData(loginDetails, AuthActionType.RegisterByInvitation, metadata);
  }

  clearData() {
    this.loginDetails = undefined;
    this.finalAction = undefined;
    this.registrationMetadata = undefined;
  }

  private updateData(loginDetails: UserRegistrationDetails, finalAction: AuthActionType, metadata?: RegistrationMetadata) {
    this.loginDetails = loginDetails;
    this.finalAction = finalAction;
    this.registrationMetadata = metadata;
  }

  addHubspotScriptForAdminRegisterPage(){
    const hubspot = document.createElement('script');
    hubspot.type = 'text/javascript';
    hubspot.id = 'hs-script-loader';
    hubspot.defer = true;
    if (envConst.name === 'production' && location.hostname.startsWith('admin')) {
      hubspot.src = '//js.hs-scripts.com/8204726.js';
    } else if (envConst.name !== 'production') {
       hubspot.async = true;
       hubspot.src = '//js.hs-scripts.com/19633783.js';
    }
    document.head.appendChild(hubspot);
  }

  removeHubspotScriptForAdminRegisterPage(){
    const elem = document.getElementById('hs-script-loader');
    document.head.removeChild(elem);
  }

  get data() {
    return this.loginDetails;
  }

  get action() {
    return this.finalAction;
  }

  get metadata() {
    return this.registrationMetadata;
  }
}
