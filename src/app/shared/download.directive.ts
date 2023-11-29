import { DownloadPurchaseInvoicePdfSuccess, StoreSubscriptionsActionType } from './../stores/store-subscriptions/+state/store-subscriptions.actions';
import { StoresCatalogActionType } from '../stores/store-catalog/+state/stores-catalog.actions';
import { StoresActionType } from './../stores/+state/stores.actions';
import { Subscription } from 'rxjs';
import { filter ,  map } from 'rxjs/operators';

import { Directive, OnDestroy, OnInit } from '@angular/core';

import { Actions, ofType } from '@ngrx/effects';

import * as FileSaver from 'file-saver';
import { StoreLocationActionType } from '../stores/store-location/+state/store-location.actions';
import { StoreOrderActionType } from '../stores/store-order/+state/store-order.actions';
import { UserActionType } from '../user/+state/user.actions';

export interface IoAction {
  type: string;
  blob: Blob;
  filename: string;
}

const isIo = (io: any): io is IoAction => {
  return ( io as IoAction).blob !== undefined && ( io as IoAction).filename !== undefined;
};

@Directive({
  selector: '[appDownload]'
})
export class DownloadDirective implements OnInit, OnDestroy {
  subscription: Subscription;

  constructor(private actions$: Actions) {}

  ngOnInit() {
    this.subscription = this.actions$.pipe(
      ofType<IoAction>(
        StoresActionType.DownloadQRImageSuccess,
        StoresActionType.DownloadQRPdfSuccess,
        StoresActionType.DownloadQRImagesSuccess,
        StoresActionType.DownloadQRFullPdfSuccess,
        StoresActionType.DownloadOrderItemsXlsSuccess,
        StoresActionType.DownloadCustomersListSuccess,
        StoreLocationActionType.DownloadLocationQRImageSuccess,
        StoreLocationActionType.DownloadLocationQRPdfSuccess,
        StoresCatalogActionType.DownloadTranslateCatalogXlsSuccess,
        StoresCatalogActionType.DownloadToUpdateCatalogXlsSuccess,
        StoresCatalogActionType.DownloadOfferImageSuccess,
        StoreSubscriptionsActionType.DownloadPurchaseInvoicePdfSuccess,
        StoreOrderActionType.DownloadOrderPdfSuccess,
        UserActionType.DownloadVoucherPdfSuccess,
        StoresActionType.DownloadFlyerFileSuccess,
      ),
      filter<IoAction>(isIo),
      map(response => FileSaver.saveAs(response.blob, response.filename))
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
