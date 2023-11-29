import { Action } from '@ngrx/store';
import { ClientStoreLocation, ClientStoreLocationRequest } from '../store-location';
import { PageableResults, Paging } from 'src/app/api/types/Pageable';
import { HideLoader, ShowLoader } from 'src/app/shared/decorators';

export enum StoreLocationActionType {
  Initialize = '[storeLocation] Initialize',
  LoadStoreLocations = '[storeLocation] LoadStoreLocations',
  LoadStoreLocationsPage = '[storeLocation] LoadStoreLocationsPage',
  LoadStoreLocationsSuccess = '[storeLocation] LoadStoreLocationsSuccess',
  LoadStoreLocationsFail = '[storeLocation] LoadStoreLocationsFail',
  InitializeSelectedStoreLocation = '[storeLocation] InitializeSelectedStoreLocation',
  LoadSelectedStoreLocation = '[storeLocation] LoadSelectedStoreLocation',
  LoadSelectedStoreLocationSuccess = '[storeLocation] LoadSelectedStoreLocationSuccess',
  LoadSelectedStoreLocationFailed = '[storeLocation] LoadSelectedStoreLocationFailed',
  OpenStoreLocationCreationForm = '[storeLocation] OpenStoreLocationCreationForm',
  CloseStoreLocationCreationForm = '[storeLocation] CloseStoreLocationCreationForm',
  CreateStoreLocation = '[storeLocation] CreateStoreLocation',
  CreateStoreLocationSuccess = '[storeLocation] CreateStoreLocationSuccess',
  CreateStoreLocationFailed = '[storeLocation] CreateStoreLocationFailed',
  UpdateStoreLocation = '[storeLocation] UpdateStoreLocation',
  UpdateStoreLocationSuccess = '[storeLocation] UpdateStoreLocationSuccess',
  UpdateStoreLocationFailed = '[storeLocation] UpdateStoreLocationFailed',
  DeleteStoreLocation = '[storeLocation] DeleteStoreLocation',
  DeleteStoreLocationSuccess = '[storeLocation] DeleteStoreLocationSuccess',
  DeleteStoreLocationFailed = '[storeLocation] DeleteStoreLocationFailed',
  DownloadLocationQRImage = '[stores] DownloadLocationQRImage',
  DownloadLocationQRImageSuccess = '[stores] DownloadLocationQRImageSuccess',
  DownloadLocationQRImageFailed = '[stores] DownloadLocationQRImageFailed',
  DownloadLocationQRPdf = '[stores] DownloadLocationQRPdf',
  DownloadLocationQRPdfSuccess = '[stores] DownloadLocationQRPdfSuccess',
  DownloadLocationQRPdfFailed = '[stores] DownloadLocationQRPdfFailed',
}

export class Initialize implements Action {
  readonly type = StoreLocationActionType.Initialize;

  constructor() {}

}

export class OpenStoreLocationCreationForm implements Action {
  readonly type = StoreLocationActionType.OpenStoreLocationCreationForm;

  constructor() {}

}

export class CloseStoreLocationCreationForm implements Action {
  readonly type = StoreLocationActionType.CloseStoreLocationCreationForm;

  constructor() {}

}

export class LoadStoreLocations implements Action {
  readonly type = StoreLocationActionType.LoadStoreLocations;

  constructor(public readonly selectedStoreId: number, public readonly paging: Paging) {}

}

export class LoadStoreLocationsPage implements Action {
  readonly type = StoreLocationActionType.LoadStoreLocationsPage;

  constructor(public readonly paging: Paging) {}

}

export class LoadStoreLocationsSuccess implements Action {
  readonly type = StoreLocationActionType.LoadStoreLocationsSuccess;

  constructor(public readonly stores: PageableResults<ClientStoreLocation>) {}

}

export class LoadStoreLocationsFail implements Action {
  readonly type = StoreLocationActionType.LoadStoreLocationsFail;

  constructor() {}

}

export class InitializeSelectedStoreLocation implements Action {
  readonly type = StoreLocationActionType.InitializeSelectedStoreLocation;

  constructor() {}

}

export class LoadSelectedStoreLocation implements Action {
  readonly type = StoreLocationActionType.LoadSelectedStoreLocation;

  constructor(public readonly storeId: number, public readonly locationId: number) {}

}

export class LoadSelectedStoreLocationSuccess implements Action {
  readonly type = StoreLocationActionType.LoadSelectedStoreLocationSuccess;

  constructor(public readonly location: ClientStoreLocation) {}

}

export class LoadSelectedStoreLocationFailed implements Action {
  readonly type = StoreLocationActionType.LoadSelectedStoreLocationFailed;

  constructor() {}

}
@ShowLoader()
export class CreateStoreLocation implements Action {
  readonly type = StoreLocationActionType.CreateStoreLocation;

  constructor(public readonly clientStoreLocation: ClientStoreLocationRequest[]) {}

}
@HideLoader(StoreLocationActionType.CreateStoreLocation)
export class CreateStoreLocationSuccess implements Action {
  readonly type = StoreLocationActionType.CreateStoreLocationSuccess;

  constructor(public readonly clientStoreLocations: ClientStoreLocation[]) {}

}
@HideLoader(StoreLocationActionType.CreateStoreLocation)
export class CreateStoreLocationFailed implements Action {
  readonly type = StoreLocationActionType.CreateStoreLocationFailed;

  constructor(public readonly error: string) {}

}
@ShowLoader()
export class UpdateStoreLocation implements Action {
  readonly type = StoreLocationActionType.UpdateStoreLocation;

  constructor(public readonly request: ClientStoreLocationRequest) {}

}
@HideLoader(StoreLocationActionType.UpdateStoreLocation)
export class UpdateStoreLocationSuccess implements Action {
  readonly type = StoreLocationActionType.UpdateStoreLocationSuccess;

  constructor(public readonly location: ClientStoreLocation) {}

}
@HideLoader(StoreLocationActionType.UpdateStoreLocation)
export class UpdateStoreLocationFailed implements Action {
  readonly type = StoreLocationActionType.UpdateStoreLocationFailed;

  constructor(public readonly error: string) {}

}

export class DeleteStoreLocation implements Action {
  readonly type = StoreLocationActionType.DeleteStoreLocation;

  constructor(public readonly id: number) {}

}

export class DeleteStoreLocationSuccess implements Action {
  readonly type = StoreLocationActionType.DeleteStoreLocationSuccess;

  constructor(public readonly label: string) {}

}

export class DeleteStoreLocationFailed implements Action {
  readonly type = StoreLocationActionType.DeleteStoreLocationFailed;

  constructor(public readonly error?: string) {}

}

export class DownloadLocationQRImage implements Action {
  readonly type = StoreLocationActionType.DownloadLocationQRImage;

  constructor(public readonly storeId: number, public readonly locationId: number) {}

}

export class DownloadLocationQRImageSuccess implements Action {
  readonly type = StoreLocationActionType.DownloadLocationQRImageSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) {}

}

export class DownloadLocationQRImageFailed implements Action {
  readonly type = StoreLocationActionType.DownloadLocationQRImageFailed;

  constructor(public readonly error: string) {}

}

export class DownloadLocationQRPdf implements Action {
  readonly type = StoreLocationActionType.DownloadLocationQRPdf;

  constructor(public readonly storeId: number, public readonly locationId: number) {}

}

export class DownloadLocationQRPdfSuccess implements Action {
  readonly type = StoreLocationActionType.DownloadLocationQRPdfSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) {}

}

export class DownloadLocationQRPdfFailed implements Action {
  readonly type = StoreLocationActionType.DownloadLocationQRPdfFailed;

  constructor(public readonly error: string) {}

}

export type StoreLocationAction =
  Initialize
  | LoadStoreLocations
  | LoadStoreLocationsPage
  | LoadStoreLocationsSuccess
  | LoadStoreLocationsFail
  | InitializeSelectedStoreLocation
  | LoadSelectedStoreLocation
  | LoadSelectedStoreLocationSuccess
  | LoadSelectedStoreLocationFailed
  | CreateStoreLocation
  | CreateStoreLocationSuccess
  | CreateStoreLocationFailed
  | UpdateStoreLocation
  | UpdateStoreLocationSuccess
  | UpdateStoreLocationFailed
  | DeleteStoreLocation
  | DeleteStoreLocationSuccess
  | DeleteStoreLocationFailed
  | OpenStoreLocationCreationForm
  | CloseStoreLocationCreationForm
  | DownloadLocationQRImage
  | DownloadLocationQRImageSuccess
  | DownloadLocationQRImageFailed
  | DownloadLocationQRPdf
  | DownloadLocationQRPdfSuccess
  | DownloadLocationQRPdfFailed;
