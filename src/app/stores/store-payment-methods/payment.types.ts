export interface PaypalAccessToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

export interface PaypalPartnerLinks {
  links: PaypalPartnerLink[];
}

export interface PaypalPartnerLink {
  href: string;
  rel: string;
  method: string;
  description: string;
}
