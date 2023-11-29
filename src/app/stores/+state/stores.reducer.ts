import { StoreLocationActionType, StoreLocationAction } from './../store-location/+state/store-location.actions';
import { ClientStore, StoreStatistics, User, StoreZoneStatus, StoreZone, Customer, StoreOrderItemsStatistics } from '../stores';
import { StoresAction, StoresActionType } from './stores.actions';
import { combineReducers } from '@ngrx/store';
import { Paging } from 'src/app/api/types/Pageable';
import { StorePaymentMethodsActionType, StorePaymentMethodsAction } from '../store-payment-methods/+state/payment.actions';
import { ApiRequestStatus } from 'src/app/api/types/Status';
import { SocialLinkErrors } from 'src/app/stores/types/SocialLinks';

export enum SortMode {
  NewestOrderSent = 'admin.store.order.newestOrderSent',
  OldestOrderSent = 'admin.store.order.oldestOrderSent',
  NewestOrderWish = 'admin.store.order.newestOrderWish',
  OldestOrderWish = 'admin.store.order.oldestOrderWish',
  NewestOrderExpected = 'admin.store.order.newestOrderExpected',
  OldestOrderExpected = 'admin.store.order.oldestOrderExpected',
  NewestOrderEffective = 'admin.store.order.newestOrderEffective',
  OldestOrderEffective = 'admin.store.order.oldestOrderEffective',
}

export enum DateTimeRangeMode {
  OrderSent = 'admin.store.order.orderSent',
  OrderWish = 'admin.store.order.orderWish',
  OrderExpected = 'admin.store.order.orderExpected',
  OrderEffective = 'admin.store.order.orderEffective',
}

export enum DateTimeRangeType {
  NoFilter = 'admin.store.order.noFilter',
  Yesterday = 'admin.store.order.yesterday',
  Today = 'admin.store.order.today',
  LastHour = 'admin.store.order.lastHour',
  Now = 'admin.store.order.now',
  NextHour = 'admin.store.order.nextHour',
  Tomorrow = 'admin.store.order.tomorrow',
  Custom = 'admin.store.order.custom',
}

export enum TableOrderingSetting {
  HIDDEN = 'HIDDEN',
  OPTIONAL = 'OPTIONAL',
  MANDATORY = 'MANDATORY'
}

export interface TabSortFilterParams {
  labelId: SortMode;
  sortQuery: string;
  isServe: boolean;
  isPickup: boolean;
  isAddress: boolean;
  customerName: string;
  orderToken: string;
  locationId: string;
  dateTimeRangeMode: DateTimeRangeMode;
  dateTimeRangeFrom: DateTimeRangeType;
  dateTimeRangeTo: DateTimeRangeType;
  customDateFrom: string;
  customDateTo: string;
  openTap: boolean;
}

export const initialTabSortFilterParams: TabSortFilterParams = {
  labelId: SortMode.NewestOrderSent,
  sortQuery: 'createdAt,desc',
  isServe: false,
  isPickup: false,
  isAddress: false,
  customerName: '',
  orderToken: '',
  locationId: '-1',
  dateTimeRangeMode: DateTimeRangeMode.OrderSent,
  dateTimeRangeFrom: DateTimeRangeType.NoFilter,
  dateTimeRangeTo: DateTimeRangeType.NoFilter,
  customDateFrom: '',
  customDateTo: '',
  openTap: false
};

export interface TabFilterBtnStatus {
  filterBtnStatus: string;
  filterPinStatus: string;
}

export const initialTabFilterBtnStatus: TabFilterBtnStatus = {
  filterBtnStatus: 'DISABLED',
  filterPinStatus: 'PINNED',
};

export const initialTabPaging: Paging = {
  page: 0,
  size: 20,
};

export interface TabUserExperience {
  tabSortFilterParams: TabSortFilterParams;
  tabFilterBtnStatus: TabFilterBtnStatus;
  tabPaging: Paging;
}

export const initialTabUserExperience: TabUserExperience = {
  tabSortFilterParams: initialTabSortFilterParams,
  tabFilterBtnStatus: initialTabFilterBtnStatus,
  tabPaging: initialTabPaging,
};

export interface StoreUserExperience {
  OPEN: TabUserExperience;
  REJECTED: TabUserExperience;
  CONFIRMED: TabUserExperience;
  READY: TabUserExperience;
  tab: string;
}

const tabNames = [
  'OPEN',
  'REJECTED',
  'CONFIRMED',
  'READY',
];

export const initialStoreUserExperience: StoreUserExperience = {
  OPEN: initialTabUserExperience,
  REJECTED: initialTabUserExperience,
  CONFIRMED: initialTabUserExperience,
  READY: initialTabUserExperience,
  tab: '',
};

export interface StoresUserExperience {
  [storeId: string]: StoreUserExperience;
}

export interface StoreImages {
  imageUrl: string;
  logoUrl: string;
}

export interface StoreStatisticList {
  statistics: StoreStatistics[];
}

export interface ZonesList {
  zones: StoreZone[];
}

export interface ZoneStatus {
  status: StoreZoneStatus;
}

export interface Zone {
  zone: StoreZone;
  zoneStatus: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
}
export interface StoreOrderItemsStatisticsList {
  status: ApiRequestStatus;
  data: StoreOrderItemsStatistics[];
  paging: Paging;
  totalPages: number;
}
export interface StoresList {
  status: ApiRequestStatus;
  data: ClientStore[];
  paging: Paging;
  totalPages: number;
}

export interface SelectedStoreState {
  store: ClientStore;
  status: ApiRequestStatus;
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
}

export interface Stores {
  list: StoresList;
  loadingStoreId: number;
  selectedStore: SelectedStoreState;
  selectedStoreImages: StoreImages;
  statisticsList: StoreStatisticList;
  orderItemsStatisticsList: StoreOrderItemsStatisticsList;
  zonesList: ZonesList;
  zoneState: ZoneStatus;
  zone: Zone;
  storesUserExperience: StoresUserExperience;
  validationStatus: string[];
  mynextLogin: MyNextLoginState;
  hubriseLogin: HubriseLoginState;
  hubriseLogout: HubriseLogoutState;
}

export interface MyNextLoginState {
  apiKey: string;
  myNextId: string;
  myNextEnabled: boolean;
  invalidCredentials: boolean;
}
export interface PowersoftLoginState {
  invalidCredentials: boolean;
}

export class HubriseLoginState {
  accessToken: string;
  locationName: string;
  catalogName: string;
  customerListName: string;
  invalidCredentials: boolean;
}

export class HubriseLogoutState {
  logoutStatus: 'INITIAL' | 'SUCCESS' | 'FAILED';
}

export interface StoresState {
  stores: Stores;
}

export interface AliasAvailabilityStatus {
  status: 'AVAILABLE' | 'READY_TO_CLAIM' | 'SUBSCRIBE_TO_CLAIM' | 'TAKEN';
}

export const selectedStoreInitialState: ClientStore = {
  id: -1,
  name: '',
  companyName: '',
  vatNumber: '',
  description: '',
  coordinates: {
    longitude: null,
    latitude: null
  },
  aliasName: '',
  address: {
    addressLine1: '',
    addressLine2: '',
    postCode: '',
    region: '',
    city: '',
    country: {
      id: null,
      name: '',
      phoneCode: '',
      europeanCountry: false
    }
  },
  companyAddress: {
    addressLine1: '',
    addressLine2: '',
    postCode: '',
    region: '',
    city: '',
    country: {
      id: -1,
      name: '',
      code: '',
      phoneCode: '',
      defaultLocale: '',
      europeanCountry: true
    }
  },
  phoneNumber: '',
  language: {
    id: null,
    name: '',
    locale: '',
  },
  relation: {
    childStores: [],
    parentStore: null,
    siblingStores: [],
  },
  settings: {},
  externalId: '',
  numberOfLocations: 0,
  numberOfOffers: 0,
  numberOfOrders: 0,
  currency: {
    name: '',
    isoCode: '',
    symbol: ''
  },
  timeZone: '',
  specialSchedules: [],
  tag: '',
  createdAt: '',
};

export const storesInitialState: Stores = {
  list: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 10 },
    totalPages: 0
  },
  loadingStoreId: -1,
  selectedStore: {
    store: selectedStoreInitialState,
    status: 'INITIAL',
    notificationsEnabled: false,
    notificationsSupported: true
  },
  selectedStoreImages: {
    imageUrl: '',
    logoUrl: ''
  },
  statisticsList: {
    statistics: []
  },
  orderItemsStatisticsList: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 10 },
    totalPages: 0
  },
  zonesList: {
    zones: []
  },
  zoneState: { status: null },
  zone: { zone: null, zoneStatus: 'INITIAL' },
  storesUserExperience: {},
  validationStatus: [],
  mynextLogin: {
    apiKey: '',
    myNextId: '',
    myNextEnabled: true,
    invalidCredentials: false,
  },
  hubriseLogin: {
    accessToken: '',
    locationName: '',
    catalogName: '',
    customerListName: '',
    invalidCredentials: false,
  },
  hubriseLogout: {
    logoutStatus: 'INITIAL',
  }
};

export function storesUserExperience(
  state: StoresUserExperience = storesInitialState.storesUserExperience,
  action: StoresAction
): StoresUserExperience {
  const newState = { ...state };
  switch (action.type) {
    case StoresActionType.InitializeStoreUserExperience:
      if (state[action.storeId]) {

        for (const tabName of tabNames) {
          if (state[action.storeId][tabName]) {
            // Do nothing as there are already tab's info...
          } else {
            newState[action.storeId][tabName] = JSON.parse(JSON.stringify(initialTabUserExperience));
          }
        }
        // Do nothing when there is already store's tab info and set 'OPEN' as default...
        newState[action.storeId].tab = state[action.storeId].tab || 'OPEN';
      } else {
        newState[action.storeId] = JSON.parse(JSON.stringify(initialStoreUserExperience));
        if (newState[action.storeId] && newState[action.storeId].tab === '') {
          newState[action.storeId].tab = 'OPEN';
        }
      }
      return { ...newState };
    case StoresActionType.UpdateStoreTabUserExperience:
      newState[action.storeId][action.tabName] = JSON.parse(JSON.stringify(action.tabUserExperience));
      newState[action.storeId].tab = action.tabName;
      return { ...newState };
    case StoresActionType.UpdateStoreTab:
      newState[action.storeId].tab = action.newTab;
      return { ...newState };
  }
  return state;
}
export function orderItemsStatisticsList(
  state: StoreOrderItemsStatisticsList = storesInitialState.orderItemsStatisticsList,
  action: StoresAction
): StoreOrderItemsStatisticsList {
  switch (action.type) {
    case StoresActionType.LoadOrderItemsStatisticsPage:
      return { ...state, status: 'LOADING', paging: action.paging };
    case StoresActionType.LoadOrderItemsStatisticsSuccess:
      return {
        status: 'LOADED',
        data: action.orderItems.data,
        paging: { ...state.paging, page: action.orderItems.pageNumber },
        totalPages: action.orderItems.totalPages
      };
  }
  return state;
}

export function list(state: StoresList = storesInitialState.list, action: StoresAction): StoresList {

  switch (action.type) {
    case StoresActionType.LoadStores:
    case StoresActionType.SearchStores:
      return { ...state, status: 'LOADING' };
    case StoresActionType.LoadStoresPage:
      return { ...state, status: 'LOADING', paging: action.paging };
    case StoresActionType.LoadStoresSuccess:
    case StoresActionType.SearchStoresSuccess:
      return {
        status: 'LOADED',
        data: action.stores.data,
        paging: { ...state.paging, page: action.stores.pageNumber },
        totalPages: action.stores.totalPages
      };
    case StoresActionType.LoadStoresFailed:
    case StoresActionType.SearchStoresFailed:
      return { ...storesInitialState.list, status: 'FAILED' };
    default:
      return state;
  }
}

export function selectedStore(
  state: SelectedStoreState = storesInitialState.selectedStore,
  action: StoresAction | StorePaymentMethodsAction | StoreLocationAction
): SelectedStoreState {

  switch (action.type) {
    case StoresActionType.InitializeState:
      return { ...storesInitialState.selectedStore };
    case StoresActionType.LoadStore:
      return {
        store: {
          ...selectedStoreInitialState,
          id: action.id },
        status: 'LOADING',
        notificationsEnabled: state.notificationsEnabled,
        notificationsSupported: state.notificationsSupported,
      };
    case StoresActionType.UpdateStore:
      return { ...state, status: 'LOADING' };
    case StoresActionType.LoadStoreSuccess:
    case StoresActionType.UpdateStoreSuccess:
      return {
        store: action.store, status: 'LOADED',
        notificationsEnabled: state.notificationsEnabled,
        notificationsSupported: state.notificationsSupported,
      };
    case StoresActionType.LoadStoreFailed:
    case StoresActionType.UpdateStoreFailed:
      return { ...state, status: 'FAILED' };
    case StoreLocationActionType.CreateStoreLocationSuccess:
      return { ...state, store: { ...state.store, numberOfLocations: state.store.numberOfLocations + action.clientStoreLocations.length } };
    case StoresActionType.DeleteStoreSuccess:
      return { ...storesInitialState.selectedStore };
    case StoreLocationActionType.DeleteStoreLocationSuccess: {
      const numberOfLocations = state.store.numberOfLocations - 1;
      const settings = { ...state.store.settings };
      settings.DELIVERY_IN_STORE_LOCATION = numberOfLocations > 0 ? settings.DELIVERY_IN_STORE_LOCATION : false;
      return { ...state, store: { ...state.store, numberOfLocations, settings } };
    }
    case StorePaymentMethodsActionType.DisconnectStripeSuccess: {
      const settings = { ...state.store.settings };
      settings.PAYMENT_STRIPE_CREDIT_CARD_ENABLED = false;
      settings.STRIPE_ACCOUNT_ID = '';
      return { ...state, store: { ...state.store, settings } };
    }
    case StorePaymentMethodsActionType.ToggleStripeSuccess:
    case StorePaymentMethodsActionType.ToggleSquareSuccess:
    case StorePaymentMethodsActionType.ConnectPaymentsenseSuccess:
      return { ...state, store: { ...state.store, settings: action.settings } };
    case StorePaymentMethodsActionType.DisconnectPaypalSuccess: {
      const settings = { ...state.store.settings };
      settings.PAYMENT_PAYPAL_ENABLED = false;
      settings.PAYPAL_MERCHANT_ID = '';
      return { ...state, store: { ...state.store, settings } };
    }
    case StorePaymentMethodsActionType.TogglePaypalSuccess:
      return { ...state, store: { ...state.store, settings: action.settings } };
    case StoresActionType.PowersoftLoginSuccess:
    case StoresActionType.DisconnectPowersoftSuccess:
    case StoresActionType.UpdateStoreSettingsSuccess: {
      return { ...state, store: action.store, status: 'LOADED' };
    }
    case StoresActionType.PowersoftLoginFailed:
    case StoresActionType.UpdateStoreSettingsFailed:
      return { ...state, status: 'FAILED' };
    case StoresActionType.PartialUpdateStoreSuccess:
      return { ...state, store: action.store };
    case StoresActionType.UpdateStoreVatPercentageSuccess:
      return { ...state, store: action.store };
    case StoresActionType.LoadNotificationSubscriptionStatusSuccess:
      return { ...state, notificationsEnabled: action.subscriptionStatus };
    case StoresActionType.ToggleNotificationSubscriptionStatusSuccess:
      return { ...state, notificationsEnabled: action.newStatus };
    case StoresActionType.ToggleNotificationPermitted:
      if (!action.permissionStatus) {
        return { ...state, notificationsEnabled: false, notificationsSupported: false };
      }
      return { ...state, notificationsSupported: true };
    case StoresActionType.GetStatusOfZoneSuccess:
      return { ...state };
    case StoresActionType.HubriseLogoutSuccess: {
      const settings = { ...state.store.settings };
      settings.HUBRISE_ACCESS_TOKEN = '';
      settings.HUBRISE_LOCATION_NAME = '';
      settings.HUBRISE_CATALOG_NAME = '';
      settings.HUBRISE_CUSTOMER_LIST_NAME = '';
      return { ...state, store: { ...state.store, settings } };
    }
    case StorePaymentMethodsActionType.ConnectJCCSuccess: {
      return { ...state, store: { ...state.store, settings: action.settings } };
    }
    case StorePaymentMethodsActionType.ConnectJCCFailed:
      return { ...state, status: 'FAILED' };
    case StorePaymentMethodsActionType.DisConnectJCCSuccess: {
      const settings = { ...state.store.settings };
      settings.jccEnabled = false;
      settings.JCC_MERCHANT_ID = '';
      return { ...state, store: { ...state.store, settings } };
    }
    case StorePaymentMethodsActionType.DisConnectJCCFailed:
      return { ...state, status: 'FAILED' };
    case StorePaymentMethodsActionType.ConnectTrustPaymentsSuccess: {
      return { ...state, store: { ...state.store, settings: action.settings } };
    }
    case StorePaymentMethodsActionType.ConnectTrustPaymentsFailed:
      return { ...state, status: 'FAILED' };
    case StorePaymentMethodsActionType.DisconnectTrustPaymentsSuccess: {
      const settings = { ...state.store.settings };
      settings.PAYMENT_TRUSTPAYMENTS_CREDIT_CARD_ENABLED = false;
      settings.TRUSTPAYMENTS_SITE_REFERENCE = '';
      settings.TRUSTPAYMENTS_WEBSERVICE_USER = '';
      settings.TRUSTPAYMENTS_WEBSERVICE_PASSWORD = '';
      return { ...state, store: { ...state.store, settings } };
    }
    case StorePaymentMethodsActionType.DisconnectTrustPaymentsFailed:
      return { ...state, status: 'FAILED' };
  }
  return state;
}

export function selectedStoreImages(state: StoreImages = storesInitialState.selectedStoreImages, action: StoresAction): StoreImages {

  switch (action.type) {
    case StoresActionType.LoadStoreSuccess:
      return { imageUrl: action.store.settings.IMAGE, logoUrl: action.store.settings.LOGO };
    case StoresActionType.UploadStoreImageSuccess:
      return { ...state, imageUrl: action.imageUrl };
    case StoresActionType.UploadStoreLogoSuccess:
      return { ...state, logoUrl: action.imageUrl };
    case StoresActionType.RemoveStoreImageSuccess:
      return { ...state, imageUrl: null  };
    case StoresActionType.RemoveStoreLogoSuccess:
      return { ...state, logoUrl: null };
  }

  return state;
}
export function validationStatus(state: string[] = storesInitialState.validationStatus, action: StoresAction): any {
  switch (action.type) {
    case StoresActionType.UpdateStoreSettingsFailed:
      return [...action.error];
    case StoresActionType.ClearStoreValidation:
      return [...action.error].filter(err => !SocialLinkErrors.ERROR_LIST.includes(err));
    default:
      return state;
  }
}

export interface ValidateAliasAvailable {
  aliasAvailabilityState: AliasAvailabilityState;
}

export interface AliasAvailabilityState {
  status: 'INITIAL' | 'LOADING' | 'LOADED';
  availabilityState: AliasAvailabilityStatus;
}

export const aliasAvailabilityInitialState: AliasAvailabilityState = {
  status: 'INITIAL',
  availabilityState: null
};



export function aliasAvailabilityState(
  state: AliasAvailabilityState = aliasAvailabilityInitialState,
  action: StoresAction): AliasAvailabilityState {
  switch (action.type) {
    case StoresActionType.ValidateAliasAvailability:
      return {
        ...state,
        status: 'LOADING'
      };
    case StoresActionType.ValidateAliasAvailabilitySuccess:
      return {
        status: 'LOADED',
        availabilityState: action.status
      };
    case StoresActionType.ValidateAliasAvailabilityFailed:
      return { ...state, availabilityState: null };
    case StoresActionType.ValidateAliasAvailabilityReset:
      return { ...state, availabilityState: null };
  }
  return state;
}

export function statisticsList(state: StoreStatisticList = storesInitialState.statisticsList, action: StoresAction): StoreStatisticList {

  switch (action.type) {
    case StoresActionType.LoadStoreStatisticsSuccess:
      return { statistics: action.statistics };
  }

  return state;
}

export function zonesList(state: ZonesList = storesInitialState.zonesList, action: StoresAction): ZonesList {
  switch (action.type) {
    case StoresActionType.LoadZonesSuccess:
      return { zones: action.zones };
    case StoresActionType.LoadZonesFailed:
      return { ...storesInitialState.zonesList };
    default:
      return state;
  }
}

export function zoneState(state: ZoneStatus = storesInitialState.zoneState, action: StoresAction): ZoneStatus {
  switch (action.type) {
    case StoresActionType.GetStatusOfZoneSuccess:
      return { status: action.status };
    case StoresActionType.GetStatusOfZoneFailed:
      return { ...storesInitialState.zoneState };
    default:
      return state;
  }
}

export function zone(state: Zone = storesInitialState.zone, action: StoresAction): Zone {
  switch (action.type) {
    case StoresActionType.LoadZone:
      return { ...state, zoneStatus: 'LOADING' };
    case StoresActionType.LoadZoneSuccess:
      return { zone: action.zone, zoneStatus: 'LOADED' };
    case StoresActionType.LoadZoneFailed:
      return { ...storesInitialState.zone };
    default:
      return state;
  }
}


export function loadingStoreId(state: number = storesInitialState.loadingStoreId, action: StoresAction): number {
  switch (action.type) {
    case StoresActionType.LoadStore:
      return action.id;
    case StoresActionType.LoadStoreFailed:
      return -1;
    default:
      return state;
  }
}




const reducer: (state: Stores, action: StoresAction) => Stores = combineReducers({
  list,
  loadingStoreId,
  selectedStore,
  selectedStoreImages,
  statisticsList,
  zonesList,
  zoneState,
  zone,
  orderItemsStatisticsList,
  storesUserExperience,
  validationStatus,
  mynextLogin,
  hubriseLogin,
  hubriseLogout
});

export function storesReducer(state: Stores = storesInitialState, action: StoresAction): Stores {
  return reducer(state, action);
}

const reducerAliasAvailability: (state: ValidateAliasAvailable, action: StoresAction) => ValidateAliasAvailable = combineReducers({
  aliasAvailabilityState
});

export function aliasAvailabilityReducer(
  state: ValidateAliasAvailable,
  action: StoresAction
): ValidateAliasAvailable {
  return reducerAliasAvailability(state, action);
}


// users begin
export interface UsersList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: User[];
  paging: Paging;
  totalPages: number;
}

export type InviteUserStatus = 'INITIAL' | 'USER_INVITATION_SENT ' | 'FAILED';

export interface InviteUserState {
  status: InviteUserStatus;
  //  errorMessage: string;
}

export interface Users {
  userList: UsersList;
  inviteUser: InviteUserState;
}

export interface UsersState {
  users: Users;
}

export const usersInitialState: Users = {
  userList: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 10 },
    totalPages: 0
  },
  inviteUser: {
    status: 'INITIAL'
    // errorMessage: ""
  }
};

export function userList(
  state: UsersList = usersInitialState.userList,
  action: StoresAction
): UsersList {
  switch (action.type) {
    case StoresActionType.LoadUsers:
    case StoresActionType.LoadUsersPage:
      return { ...state, status: 'LOADING', paging: action.paging };
    case StoresActionType.LoadUsersSuccess:
      return {
        status: 'LOADED',
        data: action.users.data,
        paging: { ...state.paging, page: action.users.pageNumber },
        totalPages: action.users.totalPages
      };
    case StoresActionType.LoadUsersFailed:
      return { ...usersInitialState.userList, status: 'FAILED' };
    default:
      return state;
  }
}

export function inviteUser(
  state = usersInitialState.inviteUser,
  action: StoresAction
): InviteUserState {
  switch (action.type) {
    case StoresActionType.InviteUserSuccess:
      return { status: 'USER_INVITATION_SENT ' };
    case StoresActionType.InviteUserFailed:
      return { status: 'FAILED' };
    default:
      return state;
  }
}

const reducerUser: (state: any, action: any) => Users = combineReducers({
  userList,
  selectedStore,
  inviteUser
});

export function storesUsersReducer(
  state: Users = usersInitialState,
  action: StoresAction
): Users {
  return reducerUser(state, action);
}

export function mynextLogin(state = storesInitialState.mynextLogin, action: StoresAction): MyNextLoginState {

  switch (action.type) {
    case StoresActionType.MynextLoginSuccess:
      if (action.response.Message === 'Invalid Credentials') {
        return { ...storesInitialState.mynextLogin, invalidCredentials: true };
      } else if (action.response.Message === 'Success') {
        return {
          apiKey: action.response.ApiKey,
          myNextId: action.response.MyNextId,
          myNextEnabled: true,
          invalidCredentials: false,
        };
      }
      break;
    case StoresActionType.MynextLoginFailed:
      return { ...storesInitialState.mynextLogin, invalidCredentials: true };
    default:
      return state;
  }
}

export function hubriseLogin(state = storesInitialState.hubriseLogin, action: StoresAction): HubriseLoginState {

  switch (action.type) {
    case StoresActionType.HubriseLoginSuccess:
      return {
        accessToken: action.response.settings.HUBRISE_ACCESS_TOKEN,
        locationName: action.response.settings.HUBRISE_LOCATION_NAME,
        catalogName: action.response.settings.HUBRISE_CATALOG_NAME,
        customerListName: action.response.settings.HUBRISE_CUSTOMER_LIST_NAME,
        invalidCredentials: false,
      };
    case StoresActionType.HubriseLogoutSuccess:
      return {
        accessToken: '',
        locationName: '',
        catalogName: '',
        customerListName: '',
        invalidCredentials: false,
      };
    case StoresActionType.HubriseLoginFailed:
      return { ...storesInitialState.hubriseLogin, invalidCredentials: true };
    default:
      return state;
  }
}

export function hubriseLogout(state = storesInitialState.hubriseLogout, action: StoresAction): HubriseLogoutState {

  switch (action.type) {
    case StoresActionType.HubriseLogoutSuccess:
      return { logoutStatus: 'SUCCESS' };
    case StoresActionType.HubriseLogoutFailed:
      return { logoutStatus: 'FAILED' };
    case StoresActionType.ClearHubriseData:
      return { logoutStatus: 'INITIAL' };
    default:
      return state;
  }
}

// users end


export interface Customers {
  customersList: CustomersList;
}

export interface CustomersList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: Customer[];
  paging: Paging;
  totalPages: number;
}

export const customersInitialState: Customers = {
  customersList: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 10 },
    totalPages: 0
  }
};

export interface CustomersState {
  customers: Customers;
}

// tslint:disable-next-line
export function customersList(state: CustomersList = customersInitialState['customersList'], action: StoresAction): CustomersList {
  switch (action.type) {
    case StoresActionType.LoadCustomersPage:
      return { ...state, status: 'LOADING', paging: action.paging };
    case StoresActionType.LoadCustomersSuccess:
      return {
        status: 'LOADED',
        data: action.customers.data,
        paging: { ...state.paging, page: action.customers.pageNumber},
        totalPages: action.customers.totalPages
      };
    case StoresActionType.LoadUsersFailed:
      return { ...customersInitialState.customersList, status: 'FAILED' };
    default:
      return state;
  }
}

const reducerCustomers: (state: any, action: any) => Customers = combineReducers({
  customersList,
  selectedStore
});

export function storeCustomersReducer(state: Customers = customersInitialState, action: StoresAction): Customers {
  return reducerCustomers(state, action);
}

