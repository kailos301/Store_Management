export interface VoucherPaymentMethodGuid {
  rendered: string;
}

export interface VoucherPaymentMethodTitle {
  rendered: string;
}

export interface VoucherPaymentMethodContent {
  rendered: string;
  protected: boolean;
}

export interface VoucherPaymentMethodLink {
  href: string;
}

export interface VoucherPaymentMethodLinks {
  self: VoucherPaymentMethodLink[];
  collection: VoucherPaymentMethodLink[];
  about: VoucherPaymentMethodLink[];
  curies: VoucherPaymentMethodLink[];
}

export interface VoucherPaymentMethod {
  id: number;
  date: any;
  date_gmt: any;
  guid: VoucherPaymentMethodGuid;
  modified: any;
  modified_gmt: any;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: VoucherPaymentMethodTitle;
  content: VoucherPaymentMethodContent;
  featured_media: number;
  template: string;
  _links: VoucherPaymentMethodLinks;
}

export interface VoucherPdfResponse {
  blob: Blob;
  filename: string;
}
