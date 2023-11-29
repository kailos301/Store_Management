export interface User {
  id: number;
  email: string;
  emailVerified: string;
  username: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  phoneCode: string;
}

export interface ClientUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  emailVerified: string;
  phoneNumber: string;
  country: {
    id: number,
    name: string,
    code: string,
    phoneCode: string,
    defaultLocale: string,
    defaultTimeZone: string,
    subscriptionPrice: number,
    subscriptionCurrency: string,
    europeanCountry: boolean,
  };
  preferredLanguage: {
    id: number,
    name: string,
    locale: string,
    code: string,
    covered_admin_ui: boolean,
    covered_customer_ui: boolean
  };
  storeRole: string;
  roles: Array<string>;
}
