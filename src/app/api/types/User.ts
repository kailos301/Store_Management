import { Country } from './Country';
import { Language } from './Language';

export interface SocialAccount {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
}

export interface UserProfile {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  countryId?: string;
  country?: Country;
  preferredLanguageId?: number;
  preferredLanguage?: Language;
  googleAccount?: SocialAccount;
  facebookAccount?: SocialAccount;
  appleAccount?: SocialAccount;
}

export interface SocialAccountLoginDetails {
    provider: string;
    accessToken: string;
    appleCode?: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface UserRegistrationDetails {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    countryId?: string;
    preferredLanguageId?: number;
    social?: SocialAccountLoginDetails;
}
