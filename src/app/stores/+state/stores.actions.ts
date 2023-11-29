import { Action } from '@ngrx/store';

import {
  ClientStore,
  ClientStoreRequest,
  StoreStatistics,
  User,
  StoreZone,
  StoreZoneStatus,
  MynextLoginResponse,
  Customer,
  StoreOrderItemsStatistics,
  PowersoftLoginRequest
} from '../stores';

import { PageableResults, Paging } from 'src/app/api/types/Pageable';
import { ShowLoader, HideLoader } from 'src/app/shared/decorators';
import { AliasAvailabilityStatus, TabUserExperience } from './stores.reducer';
import { ClientStoreOrder } from '../store-order/store-order';

export enum StoresActionType {
  InitializeState = '[stores] InitializeState',
  LoadStores = '[stores] LoadStores',
  LoadStoresPage = '[stores] LoadStoresPage',
  LoadStoresSuccess = '[stores] LoadStoresSuccess',
  LoadStoresFailed = '[stores] LoadStoresFailed',
  LoadStore = '[stores] LoadStore',
  LoadStoreSuccess = '[stores] LoadStoreSuccess',
  LoadStoreFailed = '[stores] LoadStoreFailed',
  CreateStore = '[stores] CreateStore',
  CreateStoreSuccess = '[stores] CreateStoreSuccess',
  CreateStoreFailed = '[stores] CreateStoreFailed',
  PartialUpdateStore = '[stores] PartialUpdateStore',
  PartialUpdateStoreSuccess = '[stores] PartialUpdateStoreSuccess',
  PartialUpdateStoreFailed = '[stores] PartialUpdateStoreFailed',
  DeleteStore = '[stores] DeleteStore',
  DeleteStoreSuccess = '[stores] DeleteStoreSuccess',
  DeleteStoreFailed = '[stores] DeleteStoreFailed',
  UpdateStore = '[stores] UpdateStore',
  UpdateStoreSuccess = '[stores] UpdateStoreSuccess',
  UpdateStoreFailed = '[stores] UpdateStoreFailed',
  UpdateStoreVatPercentage = '[stores] UpdateStoreVatPercentage',
  UpdateStoreVatPercentageSuccess = '[stores] UpdateStoreVatPercentageSuccess',
  UpdateStoreVatPercentageFailed = '[stores] UpdateStoreVatPercentageFailed',
  UpdateStoreSettings = '[stores] UpdateStoreSettings',
  UpdateStoreSettingsSuccess = '[stores] UpdateStoreSettingsSuccess',
  UpdateStoreSettingsFailed = '[stores] UpdateStoreSettingsFailed',
  DownloadQRImage = '[stores] DownloadQRImage',
  DownloadQRImageSuccess = '[stores] DownloadQRImageSuccess',
  DownloadQRImageFailed = '[stores] DownloadQRImageFailed',
  DownloadQRPdf = '[stores] DownloadQRPdf',
  DownloadQRPdfSuccess = '[stores] DownloadQRPdfSuccess',
  DownloadQRPdfFailed = '[stores] DownloadQRPdfFailed',
  DownloadQRImages = '[stores] DownloadQRImages',
  DownloadQRImagesSuccess = '[stores] DownloadQRImagesSuccess',
  DownloadQRImagesFailed = '[stores] DownloadQRImagesFailed',
  DownloadQRFullPdf = '[stores] DownloadQRFullPdf',
  DownloadQRFullPdfSuccess = '[stores] DownloadQRFullPdfSuccess',
  DownloadQRFullPdfFailed = '[stores] DownloadQRFullPdfFailed',
  LoadUsers = '[stores] LoadUsers',
  LoadUsersPage = '[stores] LoadUsersPage',
  LoadUsersSuccess = '[stores] LoadUsersSuccess',
  LoadUsersFailed = '[stores] LoadUsersFailed',

  LoadOrderItemsStatisticsPage = '[stores] LoadOrderItemsStatisticsPage',
  LoadOrderItemsStatisticsSuccess = '[stores] LoadOrderItemsStatisticsSuccess',
  LoadOrderItemsStatisticsFailed = '[stores] LoadOrderItemsStatisticsFailed',

  InviteUser = '[stores] InviteUser',
  InviteUserSuccess = '[stores] InviteUserSuccess',
  InviteUserFailed = '[stores] InviteUserFailed',

  RemoveUserStoreAccess = '[stores] RemoveUserStoreAccess',
  RemoveUserStoreAccessSuccess = '[stores] RemoveUserStoreAccessSuccess',
  RemoveUserStoreAccessFailed = '[stores] RemoveUserStoreAccessFailed',

  UploadStoreImage = '[stores] UploadStoreImage',
  UploadStoreImageSuccess = '[stores] UploadStoreImageSuccess',
  UploadStoreImageFailed = '[stores] UploadStoreImageFailed',
  UploadStoreLogo = '[stores] UploadStoreLogo',
  UploadStoreLogoSuccess = '[stores] UploadStoreLogoSuccess',
  UploadStoreLogoFailed = '[stores] UploadStoreLogoFailed',

  SearchStores = '[stores] SearchStores',
  SearchStoresFailed = '[stores] SearchStoresFailed',
  SearchStoresSuccess = '[stores] SearchStoresSuccess',

  LoadStoreStatistics = '[stores] LoadStoreStatistics',
  LoadStoreStatisticsFailed = '[stores] LoadStoreStatisticsFailed',
  LoadStoreStatisticsSuccess = '[stores] LoadStoreStatisticsSuccess',

  ValidateAliasAvailability = '[stores] ValidateAliasAvailability',
  ValidateAliasAvailabilitySuccess = '[stores] ValidateAliasAvailabilitySuccess',
  ValidateAliasAvailabilityFailed = '[stores] ValidateAliasAvailabilityFailed',
  ValidateAliasAvailabilityReset = '[stores] ValidateAliasAvailabilityReset',

  LoadNotificationSubscriptionStatus = '[stores] LoadNotificationSubscriptionStatus',
  LoadNotificationSubscriptionStatusSuccess = '[stores] LoadNotificationSubscriptionStatusSuccess',
  LoadNotificationSubscriptionStatusFailed = '[stores] LoadNotificationSubscriptionStatusFailed',

  RequestNotificationPermission = '[stores] RequestNotificationPermission',
  ToggleNotificationSubscriptionStatus = '[stores] ToggleNotificationSubscriptionStatus',
  ToggleNotificationSubscriptionStatusSuccess = '[stores] ToggleNotificationSubscriptionStatusSuccess',
  ToggleNotificationPermitted = '[stores] ToggleNotificationPermitted',

  CreateOrUpdateZone = '[stores] CreateOrUpdateZone',
  CreateOrUpdateZoneSuccess = '[stores] CreateOrUpdateZoneSuccess',
  CreateOrUpdateZoneFailed = '[stores] CreateOrUpdateZoneFailed',

  GetStatusOfZone = '[stores] GetStatusOfZone',
  GetStatusOfZoneSuccess = '[stores] GetStatusOfZoneSuccess',
  GetStatusOfZoneFailed = '[stores] GetStatusOfZoneFailed',

  LoadZones = '[stores] LoadZones',
  LoadZonesFailed = '[stores] LoadZonesFailed',
  LoadZonesSuccess = '[stores] LoadZonesSuccess',

  LoadZone = '[stores] LoadZone',
  LoadZoneFailed = '[stores] LoadZoneFailed',
  LoadZoneSuccess = '[stores] LoadZoneSuccess',

  RemoveZone = '[stores] RemoveZone',
  RemoveZoneSuccess = '[stores] RemoveZoneSuccess',
  RemoveZoneFailed = '[stores] RemoveZoneFailed',

  RemoveStoreLogo = '[stores] RemoveStoreLogo',
  RemoveStoreLogoSuccess = '[stores] RemoveStoreLogoSuccess',
  RemoveStoreLogoFailed = '[stores] RemoveStoreLogoFailed',

  RemoveStoreImage = '[stores] RemoveStoreImage',
  RemoveStoreImageSuccess = '[stores] RemoveStoreImageSuccess',
  RemoveStoreImageFailed = '[stores] RemoveStoreImageFailed',

  CheckStoreHasNewOrder = '[stores] CheckStoreHasNewOrder',
  CheckStoreHasNewOrderSuccess = '[stores] CheckStoreHasNewOrderSuccess',
  CheckStoreHasNewOrderFailed = '[stores] CheckStoreHasNewOrderFailed',
  StartOrderNotificationSound = '[stores] StartOrderNotificationSound',

  DownloadOrderItemsXls = '[stores] DownloadOrderItemsXls',
  DownloadOrderItemsXlsSuccess = '[stores] DownloadOrderItemsXlsSuccess',
  DownloadOrderItemsXlsFailed = '[stores] DownloadOrderItemsXlsFailed',

  InitializeStoreUserExperience = '[stores] InitializeStoreUserExperience',
  UpdateStoreTabUserExperience = '[stores] UpdateStoreTabUserExperience',
  UpdateStoreTab = '[stores] UpdateStoreTab',

  UpdateStoreZoneSettings = '[stores] UpdateStoreZoneSettings',
  UpdateStoreZoneSettingsSuccess = '[stores] UpdateStoreZoneSettingsSuccess',
  UpdateStoreZoneSettingsFailed = '[stores] UpdateStoreZoneSettingsFailed',

  ClearStoreValidation = '[stores] ClearStoreValidation',

  MynextLogin = '[stores] MynextLogin',
  MynextLoginSuccess = '[stores] MynextLoginSuccess',
  MynextLoginFailed = '[stores] MynextLoginFailed',

  HubriseLogin = '[stores] HubriseLogin',
  HubriseLoginSuccess = '[stores] HubriseLoginSuccess',
  HubriseLoginFailed = '[stores] HubriseLoginFailed',
  HubriseLogout = '[stores] HubriseLogout',
  HubriseLogoutSuccess = '[stores] HubriseLogoutSuccess',
  HubriseLogoutFailed = '[stores] HubriseLogoutFailed',
  ClearHubriseData = '[stores] ClearHubriseData',


  LoadCustomersPage = '[customers] LoadCustomersPage',
  LoadCustomersSuccess = '[customers] LoadCustomersSuccess',
  LoadCustomersFailed = '[customers] LoadCustomersFailed',

  DownloadCustomersList = '[customers] DownloadCustomersList',
  DownloadCustomersListSuccess = '[customers] DownloadCustomersListSuccess',
  DownloadCustomersListFailed = '[customers] DownloadCustomersListFailed',

  DownloadFlyerFile = '[stores] DownloadFlyerFile',
  DownloadFlyerFileSuccess = '[stores] DownloadFlyerFileSuccess',
  DownloadFlyerFileFailed = '[stores] DownloadFlyerFileFailed',
  PowersoftLogin = '[stores] PowersoftLogin',
  PowersoftLoginSuccess = '[stores] PowersoftLoginSuccess',
  PowersoftLoginFailed = '[stores] PowersoftLoginFailed',
  DisconnectPowersoftFailed = '[stores] DisconnectPowersoftFailed',
  DisconnectPowersoftSuccess = '[stores] DisconnectPowersoftSuccess',
  DisconnectPowersoft = '[stores] DisconnectPowersoft',
}

export class InitializeState implements Action {
  readonly type = StoresActionType.InitializeState;

  constructor() { }
}

export class LoadOrderItemsStatisticsPage implements Action {
  readonly type = StoresActionType.LoadOrderItemsStatisticsPage;
  constructor(
    public readonly id: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly orderItemDateType: string,
    public readonly paging: Paging,
    public readonly sort: string
  ) { }
}
export class LoadOrderItemsStatisticsSuccess implements Action {
  readonly type = StoresActionType.LoadOrderItemsStatisticsSuccess;
  constructor(public readonly orderItems: PageableResults<StoreOrderItemsStatistics>) { }
}

export class LoadOrderItemsStatisticsFailed implements Action {
  readonly type = StoresActionType.LoadOrderItemsStatisticsFailed;
  constructor(public readonly error: string) { }
}

export class GetStatusOfZone implements Action {
  readonly type = StoresActionType.GetStatusOfZone;

  constructor() { }

}

export class GetStatusOfZoneSuccess implements Action {
  readonly type = StoresActionType.GetStatusOfZoneSuccess;

  constructor(public readonly status: StoreZoneStatus) { }

}

export class GetStatusOfZoneFailed implements Action {
  readonly type = StoresActionType.GetStatusOfZoneFailed;

  constructor(public readonly errors: string[]) { }
}

export class LoadStores implements Action {
  readonly type = StoresActionType.LoadStores;

  constructor(public readonly paging: Paging, public readonly aliasName: string) { }

}

export class LoadStoresPage implements Action {
  readonly type = StoresActionType.LoadStoresPage;
  constructor(public readonly paging: Paging, public readonly aliasName: string) { }

}

export class LoadStoresSuccess implements Action {
  readonly type = StoresActionType.LoadStoresSuccess;

  constructor(public readonly stores: PageableResults<ClientStore>) { }

}

export class LoadStoresFailed implements Action {
  readonly type = StoresActionType.LoadStoresFailed;

  constructor(public readonly error: string) { }

}

export class LoadStore implements Action {
  readonly type = StoresActionType.LoadStore;

  constructor(public readonly id: number) { }

}

export class LoadStoreSuccess implements Action {
  readonly type = StoresActionType.LoadStoreSuccess;

  constructor(public readonly store: ClientStore) { }

}

export class LoadStoreFailed implements Action {
  readonly type = StoresActionType.LoadStoreFailed;

  constructor() { }

}

export class InviteUser implements Action {
  readonly type = StoresActionType.InviteUser;

  constructor(public readonly email: string, public readonly role: string, public readonly storeId: any) { }
}

export class InviteUserSuccess implements Action {
  readonly type = StoresActionType.InviteUserSuccess;

  constructor() { }
}

export class InviteUserFailed implements Action {
  readonly type = StoresActionType.InviteUserFailed;

  constructor(public readonly errorMessages: string[]) { }
}

// users

export class LoadUsers implements Action {
  readonly type = StoresActionType.LoadUsers;
  constructor(public storeId: number, public readonly paging: Paging) { }
}

export class LoadUsersPage implements Action {
  readonly type = StoresActionType.LoadUsersPage;
  constructor(public storeId: number, public readonly paging: Paging) { }
}

export class LoadUsersSuccess implements Action {
  readonly type = StoresActionType.LoadUsersSuccess;
  constructor(public readonly users: PageableResults<User>) { }
}

export class LoadUsersFailed implements Action {
  readonly type = StoresActionType.LoadUsersFailed;
  constructor(public readonly error: string) { }
}

export class RemoveUserStoreAccess implements Action {
  readonly type = StoresActionType.RemoveUserStoreAccess;

  constructor(public readonly userId: number, public readonly storeId: number) { }
}

export class RemoveUserStoreAccessSuccess implements Action {
  readonly type = StoresActionType.RemoveUserStoreAccessSuccess;

  constructor(public readonly userId: number, public readonly storeId: number) { }
}

export class RemoveUserStoreAccessFailed implements Action {
  readonly type = StoresActionType.RemoveUserStoreAccessFailed;

  constructor() { }
}


export class RemoveZone implements Action {
  readonly type = StoresActionType.RemoveZone;

  constructor(public readonly zoneId: number, public readonly storeId: number) { }
}

export class RemoveZoneSuccess implements Action {
  readonly type = StoresActionType.RemoveZoneSuccess;

  constructor(public readonly zoneId: number, public readonly storeId: number) { }
}

export class RemoveZoneFailed implements Action {
  readonly type = StoresActionType.RemoveZoneFailed;

  constructor() { }
}



// users
@ShowLoader()
export class CreateStore implements Action {
  readonly type = StoresActionType.CreateStore;

  constructor(public readonly clientStore: ClientStoreRequest) { }

}
@HideLoader(StoresActionType.CreateStore)
export class CreateStoreSuccess implements Action {
  readonly type = StoresActionType.CreateStoreSuccess;

  constructor(public readonly id: number) { }

}
@HideLoader(StoresActionType.CreateStore)
export class CreateStoreFailed implements Action {
  readonly type = StoresActionType.CreateStoreFailed;

  constructor(public readonly error?: string[]) { }

}

@ShowLoader()
export class PartialUpdateStore implements Action {
  readonly type = StoresActionType.PartialUpdateStore;

  constructor(public readonly clientStore: ClientStoreRequest) {
  }

}

@HideLoader(StoresActionType.PartialUpdateStore)
export class PartialUpdateStoreSuccess implements Action {
  readonly type = StoresActionType.PartialUpdateStoreSuccess;

  constructor(public readonly store: ClientStore) { }

}

@HideLoader(StoresActionType.PartialUpdateStore)
export class PartialUpdateStoreFailed implements Action {
  readonly type = StoresActionType.PartialUpdateStoreFailed;

  constructor(public readonly error?: string[]) { }

}

export class DeleteStore implements Action {
  readonly type = StoresActionType.DeleteStore;

  constructor(public readonly storeId: number) {
  }

}


export class DeleteStoreSuccess implements Action {
  readonly type = StoresActionType.DeleteStoreSuccess;

  constructor(public readonly storeId: number) { }

}


export class DeleteStoreFailed implements Action {
  readonly type = StoresActionType.DeleteStoreFailed;

  constructor(public readonly error?: string[]) { }

}
@ShowLoader()
export class UpdateStore implements Action {
  readonly type = StoresActionType.UpdateStore;

  constructor(public readonly clientStore: ClientStoreRequest) {
  }

}

@HideLoader(StoresActionType.UpdateStore)
export class UpdateStoreSuccess implements Action {
  readonly type = StoresActionType.UpdateStoreSuccess;

  constructor(public readonly store: ClientStore) { }

}

@HideLoader(StoresActionType.UpdateStore)
export class UpdateStoreFailed implements Action {
  readonly type = StoresActionType.UpdateStoreFailed;

  constructor(public readonly error?: string[]) { }

}

export class UpdateStoreVatPercentage implements Action {
  readonly type = StoresActionType.UpdateStoreVatPercentage;

  constructor(public readonly vatPercentage: number) { }

}

export class UpdateStoreVatPercentageSuccess implements Action {
  readonly type = StoresActionType.UpdateStoreVatPercentageSuccess;

  constructor(public readonly store: ClientStore) { }

}

export class UpdateStoreVatPercentageFailed implements Action {
  readonly type = StoresActionType.UpdateStoreVatPercentageFailed;

  constructor(public readonly error?: string[]) { }

}

export class UpdateStoreSettings implements Action {
  readonly type = StoresActionType.UpdateStoreSettings;

  constructor(public readonly settings: { [key: string]: any }) { }

}

export class UpdateStoreSettingsSuccess implements Action {
  readonly type = StoresActionType.UpdateStoreSettingsSuccess;

  constructor(public readonly store: ClientStore) { }

}

export class UpdateStoreSettingsFailed implements Action {
  readonly type = StoresActionType.UpdateStoreSettingsFailed;

  constructor(public readonly error?: string[]) { }

}

export class DownloadQRImage implements Action {
  readonly type = StoresActionType.DownloadQRImage;

  constructor(public readonly id: number, public readonly url: string) { }

}

export class DownloadQRImageSuccess implements Action {
  readonly type = StoresActionType.DownloadQRImageSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadQRImageFailed implements Action {
  readonly type = StoresActionType.DownloadQRImageFailed;

  constructor(public readonly error: string) { }

}

export class DownloadQRPdf implements Action {
  readonly type = StoresActionType.DownloadQRPdf;

  constructor(public readonly id: number) { }

}

export class DownloadQRPdfSuccess implements Action {
  readonly type = StoresActionType.DownloadQRPdfSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadQRPdfFailed implements Action {
  readonly type = StoresActionType.DownloadQRPdfFailed;

  constructor(public readonly error: string) { }

}

export class DownloadQRImages implements Action {
  readonly type = StoresActionType.DownloadQRImages;

  constructor(public readonly id: number) { }

}

export class DownloadQRImagesSuccess implements Action {
  readonly type = StoresActionType.DownloadQRImagesSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadQRImagesFailed implements Action {
  readonly type = StoresActionType.DownloadQRImagesFailed;

  constructor(public readonly error: string) { }

}

export class DownloadQRFullPdf implements Action {
  readonly type = StoresActionType.DownloadQRFullPdf;

  constructor(public readonly id: number) { }
}

export class DownloadQRFullPdfSuccess implements Action {
  readonly type = StoresActionType.DownloadQRFullPdfSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadQRFullPdfFailed implements Action {
  readonly type = StoresActionType.DownloadQRFullPdfFailed;

  constructor(public readonly error: string) { }
}
@ShowLoader()
export class UploadStoreImage implements Action {
  readonly type = StoresActionType.UploadStoreImage;

  constructor(public readonly file: File) { }
}
@HideLoader(StoresActionType.UploadStoreImage)
export class UploadStoreImageSuccess implements Action {
  readonly type = StoresActionType.UploadStoreImageSuccess;

  constructor(public readonly imageUrl: string) { }
}
@HideLoader(StoresActionType.UploadStoreImage)
export class UploadStoreImageFailed implements Action {
  readonly type = StoresActionType.UploadStoreImageFailed;

  constructor(public readonly errorMessages: string[]) { }
}
@ShowLoader()
export class UploadStoreLogo implements Action {
  readonly type = StoresActionType.UploadStoreLogo;

  constructor(public readonly file: File) { }
}
@HideLoader(StoresActionType.UploadStoreLogo)
export class UploadStoreLogoSuccess implements Action {
  readonly type = StoresActionType.UploadStoreLogoSuccess;

  constructor(public readonly imageUrl: string) { }
}
@HideLoader(StoresActionType.UploadStoreLogo)
export class UploadStoreLogoFailed implements Action {
  readonly type = StoresActionType.UploadStoreLogoFailed;

  constructor(public readonly errorMessages: string[]) { }
}

export class SearchStores implements Action {
  readonly type = StoresActionType.SearchStores;

  constructor(public readonly alias: string) { }
}

export class SearchStoresSuccess implements Action {
  readonly type = StoresActionType.SearchStoresSuccess;

  constructor(public readonly stores: PageableResults<ClientStore>) { }
}

export class SearchStoresFailed implements Action {
  readonly type = StoresActionType.SearchStoresFailed;

  constructor(public readonly error: string) { }
}

export class LoadStoreStatistics implements Action {
  readonly type = StoresActionType.LoadStoreStatistics;

  constructor(
    public readonly duration: number,
    public readonly from: string,
    public readonly to: string,
    public readonly periodicTerm: string,
  ) { }
}

export class LoadStoreStatisticsSuccess implements Action {
  readonly type = StoresActionType.LoadStoreStatisticsSuccess;

  constructor(public readonly statistics: StoreStatistics[]) { }
}

export class LoadStoreStatisticsFailed implements Action {
  readonly type = StoresActionType.LoadStoreStatisticsFailed;

  constructor(public readonly error: string) { }
}

export class ValidateAliasAvailability implements Action {
  readonly type = StoresActionType.ValidateAliasAvailability;

  constructor(public readonly storeId: number, public readonly alias: string) { }
}

export class ValidateAliasAvailabilitySuccess implements Action {
  readonly type = StoresActionType.ValidateAliasAvailabilitySuccess;

  constructor(public readonly status: AliasAvailabilityStatus) { }
}

export class ValidateAliasAvailabilityFailed implements Action {
  readonly type = StoresActionType.ValidateAliasAvailabilityFailed;

  constructor(public readonly error: string) { }
}

export class ValidateAliasAvailabilityReset implements Action {
  readonly type = StoresActionType.ValidateAliasAvailabilityReset;

  constructor() { }
}

export class LoadNotificationSubscriptionStatus implements Action {
  readonly type = StoresActionType.LoadNotificationSubscriptionStatus;

  constructor(public readonly storeId: number, public readonly pushSubscription: PushSubscription) { }
}

export class LoadNotificationSubscriptionStatusSuccess implements Action {
  readonly type = StoresActionType.LoadNotificationSubscriptionStatusSuccess;

  constructor(public readonly subscriptionStatus: boolean) { }
}

export class LoadNotificationSubscriptionStatusFailed implements Action {
  readonly type = StoresActionType.LoadNotificationSubscriptionStatusFailed;

  constructor(public readonly errors: string[]) { }
}

export class RequestNotificationPermission implements Action {
  readonly type = StoresActionType.RequestNotificationPermission;

  constructor() { }
}

export class ToggleNotificationSubscriptionStatus implements Action {
  readonly type = StoresActionType.ToggleNotificationSubscriptionStatus;

  constructor(public readonly newStatus: boolean, public readonly pushSubscription: PushSubscription) { }
}

export class ToggleNotificationSubscriptionStatusSuccess implements Action {
  readonly type = StoresActionType.ToggleNotificationSubscriptionStatusSuccess;

  constructor(public readonly newStatus: boolean) { }
}

export class ToggleNotificationPermitted implements Action {
  readonly type = StoresActionType.ToggleNotificationPermitted;

  constructor(public readonly permissionStatus: boolean) { }
}

// zones
export class CreateOrUpdateZone implements Action {
  readonly type = StoresActionType.CreateOrUpdateZone;

  constructor(public readonly zoneSetting: StoreZone, public readonly id: number = 0) { }

}
export class CreateOrUpdateZoneSuccess implements Action {
  readonly type = StoresActionType.CreateOrUpdateZoneSuccess;

  constructor(public readonly storeId: number, public readonly zoneId: number) { }

}
export class CreateOrUpdateZoneFailed implements Action {
  readonly type = StoresActionType.CreateOrUpdateZoneFailed;

  constructor(public readonly error: string[]) { }

}


export class LoadZones implements Action {
  readonly type = StoresActionType.LoadZones;

  constructor() { }
}

export class LoadZonesSuccess implements Action {
  readonly type = StoresActionType.LoadZonesSuccess;

  constructor(public readonly zones: StoreZone[]) { }

}

export class LoadZonesFailed implements Action {
  readonly type = StoresActionType.LoadZonesFailed;

  constructor(public readonly error: string) { }
}


export class LoadZone implements Action {
  readonly type = StoresActionType.LoadZone;
  constructor(public readonly storeId: number, public readonly id: number) { }
}

export class LoadZoneSuccess implements Action {
  readonly type = StoresActionType.LoadZoneSuccess;
  constructor(public readonly zone: StoreZone) { }
}

export class LoadZoneFailed implements Action {
  readonly type = StoresActionType.LoadZoneFailed;
  constructor() { }
}


@ShowLoader()
export class RemoveStoreLogo implements Action {
  readonly type = StoresActionType.RemoveStoreLogo;

  constructor(public readonly storeId: number) { }
}

@HideLoader(StoresActionType.RemoveStoreLogo)
export class RemoveStoreLogoSuccess implements Action {
  readonly type = StoresActionType.RemoveStoreLogoSuccess;

  constructor(public readonly storeId: number) { }
}

@HideLoader(StoresActionType.RemoveStoreLogo)
export class RemoveStoreLogoFailed implements Action {
  readonly type = StoresActionType.RemoveStoreLogoFailed;

  constructor() { }
}

@ShowLoader()
export class RemoveStoreImage implements Action {
  readonly type = StoresActionType.RemoveStoreImage;

  constructor(public readonly storeId: number) { }
}

@HideLoader(StoresActionType.RemoveStoreImage)
export class RemoveStoreImageSuccess implements Action {
  readonly type = StoresActionType.RemoveStoreImageSuccess;

  constructor(public readonly storeId: number) { }
}

@HideLoader(StoresActionType.RemoveStoreImage)
export class RemoveStoreImageFailed implements Action {
  readonly type = StoresActionType.RemoveStoreImageFailed;

  constructor() { }
}

export class CheckStoreHasNewOrder implements Action {
  readonly type = StoresActionType.CheckStoreHasNewOrder;

  constructor() { }
}

export class CheckStoreHasNewOrderSuccess implements Action {
  readonly type = StoresActionType.CheckStoreHasNewOrderSuccess;

  constructor(public readonly orders: PageableResults<ClientStoreOrder>) { }
}

export class CheckStoreHasNewOrderFailed implements Action {
  readonly type = StoresActionType.CheckStoreHasNewOrderFailed;

  constructor() { }
}

export class StartOrderNotificationSound implements Action {
  readonly type = StoresActionType.StartOrderNotificationSound;

  constructor(public readonly audioSrc: string) { }

}

export class DownloadOrderItemsXls implements Action {
  readonly type = StoresActionType.DownloadOrderItemsXls;

  constructor(
    public readonly storeId: number,
    public readonly orderItemReportType: string,
    public readonly fromDate: string,
    public readonly toDate: string,
  ) { }

}

export class DownloadOrderItemsXlsSuccess implements Action {
  readonly type = StoresActionType.DownloadOrderItemsXlsSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadOrderItemsXlsFailed implements Action {
  readonly type = StoresActionType.DownloadOrderItemsXlsFailed;

  constructor(public readonly error: string) { }

}

export class InitializeStoreUserExperience implements Action {
  readonly type = StoresActionType.InitializeStoreUserExperience;

  constructor(public readonly storeId: number) { }
}

export class UpdateStoreTabUserExperience implements Action {
  readonly type = StoresActionType.UpdateStoreTabUserExperience;

  constructor(public readonly storeId: number, public readonly tabName: string, public readonly tabUserExperience: TabUserExperience) { }
}

export class UpdateStoreTab implements Action {
  readonly type = StoresActionType.UpdateStoreTab;

  constructor(public readonly storeId: number, public readonly newTab) { }
}

export class UpdateStoreZoneSettings implements Action {
  readonly type = StoresActionType.UpdateStoreZoneSettings;

  constructor(public readonly id: number, public readonly settings: { [key: string]: any }) { }

}

export class UpdateStoreZoneSettingsSuccess implements Action {
  readonly type = StoresActionType.UpdateStoreZoneSettingsSuccess;

  constructor(public readonly zone: StoreZone) { }

}

export class UpdateStoreZoneSettingsFailed implements Action {
  readonly type = StoresActionType.UpdateStoreZoneSettingsFailed;

  constructor(public readonly error?: string[]) { }

}

export class MynextLogin implements Action {
  readonly type = StoresActionType.MynextLogin;

  constructor(public readonly username: string, public readonly password: string) { }

}
export class MynextLoginSuccess implements Action {
  readonly type = StoresActionType.MynextLoginSuccess;

  constructor(public readonly response: MynextLoginResponse) { }

}

export class MynextLoginFailed implements Action {
  readonly type = StoresActionType.MynextLoginFailed;

  constructor() { }
}

export class PowersoftLogin implements Action {
  readonly type = StoresActionType.PowersoftLogin;

  constructor(public readonly storeId: number, public readonly reqObj: PowersoftLoginRequest) { }

}

export class PowersoftLoginSuccess implements Action {
  readonly type = StoresActionType.PowersoftLoginSuccess;

  constructor(public readonly store: ClientStore) { }

}

export class PowersoftLoginFailed implements Action {
  readonly type = StoresActionType.PowersoftLoginFailed;

  constructor(public readonly error: string) { }
}

export class DisconnectPowersoft implements Action {
  readonly type = StoresActionType.DisconnectPowersoft;

  constructor(public readonly storeId: number) { }

}

export class DisconnectPowersoftSuccess implements Action {
  readonly type = StoresActionType.DisconnectPowersoftSuccess;

  constructor(public readonly store: ClientStore) { }

}

export class DisconnectPowersoftFailed implements Action {
  readonly type = StoresActionType.DisconnectPowersoftFailed;

  constructor(public readonly error: string) { }
}


export class ClearStoreValidation implements Action {
  readonly type = StoresActionType.ClearStoreValidation;

  constructor(public readonly error?: string[]) { }

}

export class HubriseLogin implements Action {
  readonly type = StoresActionType.HubriseLogin;

  constructor(public storeId: number, public readonly authCode: string) { }

}

export class HubriseLoginSuccess implements Action {
  readonly type = StoresActionType.HubriseLoginSuccess;

  constructor(public readonly response: ClientStore) { }

}

export class HubriseLoginFailed implements Action {
  readonly type = StoresActionType.HubriseLoginFailed;

  constructor() { }
}

export class HubriseLogout implements Action {
  readonly type = StoresActionType.HubriseLogout;

  constructor(public storeId: number) { }

}

export class HubriseLogoutSuccess implements Action {
  readonly type = StoresActionType.HubriseLogoutSuccess;

  constructor(public readonly response: ClientStore) { }

}

export class HubriseLogoutFailed implements Action {
  readonly type = StoresActionType.HubriseLogoutFailed;

  constructor() { }

}


export class ClearHubriseData implements Action {
  readonly type = StoresActionType.ClearHubriseData;

  constructor() { }

}

export class LoadCustomersPage implements Action {
  readonly type = StoresActionType.LoadCustomersPage;
  constructor(
    public storeId: number,
    public readonly email: string,
    public readonly name: string,
    public readonly phoneNumber: string,
    public readonly sortingColumn: string,
    public readonly paging: Paging) { }
}

export class LoadCustomersSuccess implements Action {
  readonly type = StoresActionType.LoadCustomersSuccess;
  constructor(public readonly customers: PageableResults<Customer>) { }
}

export class LoadCustomersFailed implements Action {
  readonly type = StoresActionType.LoadCustomersFailed;
  constructor(public readonly error: string) { }
}


export class DownloadCustomersList implements Action {
  readonly type = StoresActionType.DownloadCustomersList;

  constructor(
    public readonly storeId: number,
    public readonly email: string,
    public readonly name: string,
    public readonly phoneNumber: string) { }

}

export class DownloadCustomersListSuccess implements Action {
  readonly type = StoresActionType.DownloadCustomersListSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadCustomersListFailed implements Action {
  readonly type = StoresActionType.DownloadCustomersListFailed;

  constructor(public readonly error: string) { }
}


export class DownloadFlyerFile implements Action {
  readonly type = StoresActionType.DownloadFlyerFile;

  constructor(public readonly storeId: number, public readonly voucherCode: string) {}

}

export class DownloadFlyerFileSuccess implements Action {
  readonly type = StoresActionType.DownloadFlyerFileSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) {}

}

export class DownloadFlyerFileFailed implements Action {
  readonly type = StoresActionType.DownloadFlyerFileFailed;

  constructor(public readonly error: string) {}

}

export type StoresAction =
  InitializeState
  | LoadStores
  | LoadStoresPage
  | LoadStoresSuccess
  | LoadStoresFailed
  | LoadStore
  | LoadStoreSuccess
  | LoadStoreFailed
  | CreateStore
  | CreateStoreSuccess
  | CreateStoreFailed
  | PartialUpdateStore
  | PartialUpdateStoreSuccess
  | PartialUpdateStoreFailed
  | DeleteStore
  | DeleteStoreSuccess
  | DeleteStoreFailed
  | UpdateStore
  | UpdateStoreSuccess
  | UpdateStoreFailed
  | UpdateStoreSettings
  | UpdateStoreSettingsSuccess
  | UpdateStoreSettingsFailed
  | DownloadQRImage
  | DownloadQRImageSuccess
  | DownloadQRImageFailed
  | DownloadQRPdf
  | DownloadQRPdfSuccess
  | DownloadQRPdfFailed
  | DownloadQRImages
  | DownloadQRImagesSuccess
  | DownloadQRImagesFailed
  | DownloadQRFullPdf
  | DownloadQRFullPdfSuccess
  | DownloadQRFullPdfFailed
  | LoadUsers
  | LoadUsersPage
  | LoadUsersFailed
  | LoadUsersSuccess
  | InviteUser
  | InviteUserSuccess
  | InviteUserFailed
  | RemoveUserStoreAccess
  | RemoveUserStoreAccessSuccess
  | RemoveUserStoreAccessFailed
  | UploadStoreImage
  | UploadStoreImageSuccess
  | UploadStoreImageFailed
  | UploadStoreLogo
  | UploadStoreLogoSuccess
  | UploadStoreLogoFailed
  | SearchStores
  | SearchStoresFailed
  | SearchStoresSuccess
  | LoadStoreStatistics
  | LoadStoreStatisticsFailed
  | LoadStoreStatisticsSuccess
  | ValidateAliasAvailability
  | ValidateAliasAvailabilitySuccess
  | ValidateAliasAvailabilityFailed
  | ValidateAliasAvailabilityReset
  | ValidateAliasAvailabilityReset
  | LoadNotificationSubscriptionStatus
  | LoadNotificationSubscriptionStatusSuccess
  | LoadNotificationSubscriptionStatusFailed
  | RequestNotificationPermission
  | ToggleNotificationSubscriptionStatus
  | ToggleNotificationSubscriptionStatusSuccess
  | ToggleNotificationPermitted
  | CreateOrUpdateZone
  | CreateOrUpdateZoneSuccess
  | CreateOrUpdateZoneFailed
  | GetStatusOfZone
  | GetStatusOfZoneSuccess
  | GetStatusOfZoneFailed
  | LoadZones
  | LoadZonesSuccess
  | LoadZonesFailed
  | LoadZone
  | LoadZoneSuccess
  | LoadZoneFailed
  | RemoveZone
  | RemoveZoneSuccess
  | RemoveZoneFailed
  | RemoveStoreLogo
  | RemoveStoreLogoFailed
  | RemoveStoreImage
  | RemoveStoreLogoSuccess
  | RemoveStoreImageSuccess
  | RemoveStoreImageFailed
  | CheckStoreHasNewOrder
  | CheckStoreHasNewOrderSuccess
  | CheckStoreHasNewOrderFailed
  | StartOrderNotificationSound
  | DownloadOrderItemsXls
  | DownloadOrderItemsXlsFailed
  | DownloadOrderItemsXlsSuccess
  | InitializeStoreUserExperience
  | UpdateStoreTabUserExperience
  | UpdateStoreTab
  | UpdateStoreZoneSettings
  | UpdateStoreZoneSettingsSuccess
  | UpdateStoreZoneSettingsFailed
  | UpdateStoreVatPercentage
  | UpdateStoreVatPercentageSuccess
  | UpdateStoreVatPercentageFailed
  | MynextLogin
  | MynextLoginSuccess
  | MynextLoginFailed
  | ClearStoreValidation
  | HubriseLogin
  | HubriseLoginSuccess
  | HubriseLoginFailed
  | HubriseLogout
  | HubriseLogoutSuccess
  | HubriseLogoutFailed
  | ClearHubriseData
  | LoadCustomersPage
  | LoadCustomersSuccess
  | LoadCustomersFailed
  | DownloadCustomersList
  | DownloadCustomersListSuccess
  | DownloadCustomersListFailed
  | LoadOrderItemsStatisticsSuccess
  | LoadOrderItemsStatisticsFailed
  | LoadOrderItemsStatisticsPage
  | DownloadFlyerFile
  | DownloadFlyerFileSuccess
  | DownloadFlyerFileFailed
  | PowersoftLogin
  | PowersoftLoginSuccess
  | PowersoftLoginFailed
  | DisconnectPowersoft
  | DisconnectPowersoftSuccess
  | DisconnectPowersoftFailed
  ;

