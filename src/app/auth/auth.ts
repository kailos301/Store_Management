import { Language } from 'src/app/api/types/Language';

export class Tokens {
  jwt: string;
  refreshToken: string;
}

export class LoginResponse {
  userId: number;
  username: string;
  tokens: Tokens;
}


export class LoggedInUser {
  id: number;
  username: string;
  authenticationMethod: 'PASSWORD' | 'SOCIAL';
  superAdmin: boolean;
  affiliate: boolean;
  preferredLanguage: Language;
  numberOfStores: number;
  storeRoles: Record<number, string>;
}

export class LocationInfo {
  cityName: string;
  countryCode: string;
  countryName: string;
  ipAddress: string;
  ipVersion: number;
  regionName: string;
  timeZone: string;
  zipCode: string;
}
