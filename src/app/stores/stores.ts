import { Schedule } from './store-schedule/stores-schedule';
import { StoreSubscription } from './store-subscriptions/subscriptions';

export interface ClientStore {
  id: number;
  name: string;
  companyName: string;
  vatNumber: string;
  description: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  aliasName: string;
  address: StoreAddress;
  companyAddress: StoreCompanyAddress;
  phoneNumber: string;
  language: {
    id: number;
    name: string;
    locale: string;
  };
  settings: { [key: string]: any };
  externalId: string;
  numberOfLocations: number;
  numberOfOffers: number;
  numberOfOrders: number;
  subscription?: StoreSubscription;
  currency?: {
    name: string;
    isoCode: string;
    symbol: string;
  };
  timeZone?: string;
  orderMinAmountDelivery?: number;
  orderFeeDelivery?: number;
  orderAmountFreeDelivery?: number;
  specialSchedules: SpecialSchedule[];
  tag: string;
  createdAt: string;
  vatPercentage?: number;
  relation: {
    childStores: any[];
    parentStore: any;
    siblingStores: any[];
  };
}

export interface StoreAddress {
  addressLine1: string;
  addressLine2: string;
  postCode: string;
  region: string;
  city: string;
  country: {
    id: number;
    name: string;
    code?: string;
    phoneCode: string;
    defaultLocale?: string;
    europeanCountry: boolean;
  };
}
export interface StoreCompanyAddress {
  addressLine1: string;
  addressLine2: string;
  postCode: string;
  region: string;
  city: string;
  country: {
    id: number;
    name: string;
    code?: string;
    phoneCode: string;
    defaultLocale?: string;
    europeanCountry: boolean;
  };
}

export interface ClientStoreRequest {
  id?: number;
  name?: string;
  description?: string;
  aliasName?: string;
  externalId?: string;
  longitude?: number;
  latitude?: number;
  countryId?: number;
  languageId?: number;
  addressLine1?: string;
  addressLine2?: string;
  postCode?: string;
  region?: string;
  city?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  timeZone?: string;
  orderMinAmountDelivery?: number;
  orderFeeDelivery?: number;
  subscription?: StoreSubscription;
}

export interface StoreSettingUpdateRequest {
  key: string;
  value: any;
}

export interface QRCodeResponse {
  blob: Blob;
  filename: string;
}

export interface OrderItemXlsResponse {
  blob: Blob;
  filename: string;
}

export interface CategoriesListResponse {
  categories: Category[];
}

export interface Category {
  categoryId: number;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  availability: boolean;
  hierarchyLevel?: string;
  isSellable: boolean;
  languuageTranslation?: LanguageTranslation[];
  max?: number;
  min: number;
  offers: Offer[];
  position: number;
  catalogId: number;
  orderMultipleSameItem?: boolean;
  // aliasName: string;
}

export interface StoreCatalog {
  categories: Category[];
  offers: Offer[];
  catalogId: number;
  currency: string;
}

export interface SaveOfferView {
  offer: Offer;
  contentItem: ContentItemModel[];
}

export interface User {
  id: number;
  email: string;
  username: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  phoneCode: string;
}

export interface SaveCategoryView {
  category: Category;
  contentItem: ContentItemModel[];
}

export interface SaveOfferPositionView {
  offers: Offer[];
}
export interface SaveCategoryRequest {
  category: Category;
  contentItem: ContentItemModel[];
}

export interface Offer {
  offerId: number;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  price: number;
  discount: number;
  categoryId: number;
  position: number;
  availability: number;
  contentItem?: ContentItemModel[];
  discountType: string;
  aliasName?: string;
  isSellable: boolean;
  global?: boolean;
  catalogId: number;
  standardImage?: ImageData;  // needed to be (at least optionally) defined for public interface
  options?: any[];    // needed to be (at least optionally) defined for public interface
  categories?: Category[];
  contentItemId?: number;
  hierarchyLevel?: string;
  languageTranslation?: LanguageTranslation[];
  variants?: OfferVariant[];
  priceDescription?: string;
  isOrderable: boolean;
  attributeDtos: KeyValuePair[];
  // display?: boolean; // Use to filter out items using alternate search approach
}

export interface OfferVariant {
  offerId: number;
  price: number;
  priceDescription?: string;
  discount?: number;
  discountType?: string;
}

export interface ContentItemModel {
  languageId: number;
  name: string;
  shortDescription: string;
  longDescription: string;
}

export interface OrderItem {
  childItemRequests?: any[];
  offerId: number;
  name?: string;
  hierarchyLevel?: string;
  variantOfferId?: number;
  priceDescription?: string;
  itemName?: string;
  quantity: number;
  discountType?: string;
  discountValue?: number;
  offerPrice?: number;
  price?: number;
  totalNonDiscountedPrice?: number;
  totalDiscountedPrice?: number;
  uuid?: string;
  comment?: string;
  formattedDiscountValue?: string;
  formattedOfferPrice?: string;
  formattedTotalNonDiscountedPrice?: string;
  formattedTotalDiscountedPrice?: string;
  childOrderItems?: OrderItem[];
}

export interface Order {
  locationId?: number;
  location?: string | number;
  locationComment?: string;
  orderItems?: OrderItem[];
  status?: 'DRAFT' | 'SUBMITTED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED';
  uuid?: string;
  totalDiscountedPrice?: number;
  totalNonDiscountedPrice?: number;
  deliveryFee?: number;
  formattedTotalDiscountedPrice?: string;
  formattedTotalNonDiscountedPrice?: string;
  formattedDeliveryFee?: string;
  comment?: string;
  customerUserId?: number;
  customerName?: string;
  customerPhoneNumber?: string;
  customerEmail?: string;
  deliveryMethod?: 'NO_LOCATION' | 'IN_STORE_LOCATION' | 'ADDRESS';
  paymentStatus?: 'NO_PAYMENT' | 'IN_PROGRESS' | 'SUCCESSFULLY_COMPLETED';
  currency?: string;
  orderToken?: string;
  createdAt?: string;
  wishTime?: string;
  slotEndTime?: string;
  estimatedDuration?: Date;
  isReady?: boolean;
  deliveryStreetAddress?: string;
  deliveryPostCode?: string;
  deliveryCity?: string;
  floorNumber?: string;
  estimatedTime?: string;
  rejectReason?: string;
  uiLanguageLocale?: string;
  catalogLanguageLocale?: string;
  voucherCode?: string;
  voucherDiscount?: number;
  voucherDiscountType?: 'MONETARY' | 'PERCENTILE';
  voucherDiscountPercentage?: number;
  formattedVoucherDiscount?: string;
  latitude?: number;
  longitude?: number;
  storeId?: number;
  storeAliasName?: string;
  storeUserFirstName?: string;
  storeUserLastName?: string;
}

export interface StoreViewState {
  state:
  'LOADING' |
  'LOADED' |
  'VIEWPRODUCTDETAILS' |
  'VIEWPRODUCTDETAILSFROMCARTVIEW' |
  'VIEWCART' |
  'CHECKOUT' |
  'THANKYOUPAGE' |
  'ERRORPAGE' |
  'EMPTYCARTPAGE'
  ;
}

export interface OrderMeta {
  comment?: string;
  customerUserId?: number;
  customerEmail?: string;
  customerName?: string;
  customerPhoneNumber?: string;
  customerStreet?: string;
  customerZip?: string;
  customerTown?: string;
  deliveryMethod?: string;
  paymentOption?: number;
  paymentMethod?: number;
  paymentStatus?: string;
  location?: string;
  voucherCode?: string;
  wishTime?: string;
  customerFloor?: string;
  latitude?: number;
  longitude?: number;
  tapId?: string;
}

export interface Availability {
  id: number;
  startTime: string;
  endTime: string;
}

export interface Lang {
  id: number;
  locale: string;
  name: string;
}

export interface LanguageTranslation {
  languageId: number;
  name: string;
  shortDescription?: string;
  longDescription?: string;
}

export interface Voucher {
  id: number;
  code: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  maxTimesUse: number;
  value: number;
  discount: number;
  owner: number;
  commission: number;
  comment: string;
  voucherAssignmentStatus: string;
  formattedDiscountAmount: string;
  formattedCommissionAmount: string;
}

export interface Commission {
  code: string;
  storeId: number;
  storeAlias: string;
  commission: number;
  commissionAmount: number;
  formattedCommissionAmount: string;
  useDate: string;
  formattedEndDate: string;
  commissionStatus: string;
}

export interface StoreVoucherRequest {
  id: number;
  total: number;
  discount: number;
  commission: number;
  comment: string;
  mode: string;
  code: string;
  endDate: any;
  voucherAssignmentStatus: string;
  formattedDiscountAmount: string;
  formattedCommissionAmount: string;
}

export interface StoreStatistics {
  day: number;
  year: number;
  month: number;
  draftCount: number;
  submitCount: number;
  receivedCount: number;
  cancelCount: number;
  closedCount: number;
  totalSubmitted: number;
  totalViewings: number;
  totalPaid: number;
  totalNonPaid: number;
  total: number;
}
export interface StoreOrderItemsStatistics {
  offer: string;
  totalQuantity: number;
  totalNonDiscountedPrice: number;
  totalDiscountedPrice: number;
  imageUrl: string;
}

export enum LocationType {
  TABLE = 'TABLE',
  ROOM = 'ROOM',
  LOCATION = 'LOCATION',
}

export interface LocationValid {
  isValid: boolean;
  id?: number;
  label?: string;
  storeLocations?: StoreLocation[];
  locationType?: LocationType;
  description?: string;
  status?: string;
}

export interface StoreLocation {
  id: number;
  label: string;
}

export interface TimeZone {
  zoneId: string;
  label: string;
}

export interface EmailMessage {
  body: {};
  statusCode: string;
  statusCodeValue: number;
}

export interface SendEmailModel {
  storeId: number;
  userId: number;
  message: string;
}

export interface StoreZone {
  id?: number;
  name: string;
  type: string;
  minRadius?: number;
  maxRadius?: number;
  radiusUnit: string;
  orderMinAmountDelivery?: number;
  orderFeeDelivery?: number;
  orderAmountFreeDelivery?: number;
  postcodes: string;
  settings: { [key: string]: any };
  scheduleId: number;
}

export interface StoreZoneStatus {
  enableRestriction: boolean;
}

export type SpecialScheduleType = 'OPENING_HOURS';

export interface SpecialSchedule {
  id: number;
  type: SpecialScheduleType;
  schedule: Schedule;
}
export interface KeyValuePair {
  key: string;
  value: boolean;
}

export class MynextLoginResponse {
  ApiKey: string;
  MyNextId: string;
  Message: string;
}
export class PowersoftLoginResponse {
  accessToken: string;
  agentCode: string;
  genericCustomerCode: string;
  genericCustomerEmail: string;
}

export class PowersoftLoginRequest {
  accessToken: string;
  agentCode: string;
  genericCustomerCode: string;
  genericCustomerEmail: string;
}

export interface Customer {
  name: string;
  email: string;
  phoneNumber: string;
  orderCount: number;
  firstOrderUpdatedAt: string;
  lastOrderUpdatedAt: string;
}

export interface CustomersListDownloadResponse {
  blob: Blob;
  filename: string;
}

export interface AssociatedZone {
  id: number;
  name: string;
  type: string;
  orderMinAmountDelivery: number;
  orderFeeDelivery: number;
  orderAmountFreeDelivery: number;
  postcodes: string;
  settings: {[key: string]: any};
  storeId: number;
}
