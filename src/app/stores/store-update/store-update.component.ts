import { getSelectedStore, getStoreImage, getStoreLogo } from './../+state/stores.selectors';
import { Observable, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoresState, StoreImages } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { ClientStoreRequest } from '../stores';
import { map, take, tap } from 'rxjs/operators';
import {
  UpdateStore,
  UploadStoreImage,
  UploadStoreLogo,
  UpdateStoreSuccess,
  StoresAction,
  RemoveStoreImage,
  RemoveStoreLogo
} from '../+state/stores.actions';

@Component({
  selector: 'app-store-update',
  templateUrl: './store-update.component.html',
  styleUrls: ['./store-update.component.scss']
})
export class StoreUpdateComponent implements OnInit {

  storeUpdate$: Observable<ClientStoreRequest>;

  currentStore$: Observable<string>;

  storeImage$: Observable<string>;

  storeLogo$: Observable<string>;

  storeId: number;

  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    this.currentStore$ = this.store.pipe(
      select(getSelectedStore),
      map(s => s.name)
    );

    this.storeUpdate$ = this.store.pipe(
      select(getSelectedStore),
      tap(s => this.storeId = s.id),
      map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        aliasName: s.aliasName,
        externalId: s.externalId,
        longitude: s.coordinates.longitude,
        latitude: s.coordinates.latitude,
        countryId: s.address.country.id,
        languageId: s.language.id,
        addressLine1: s.address.addressLine1,
        addressLine2: s.address.addressLine2,
        postCode: s.address.postCode,
        region: s.address.region,
        city: s.address.city,
        phoneCountryCode: s.address.country.phoneCode,
        phoneNumber: s.phoneNumber,
        timeZone: s.timeZone,
        subscription: s.subscription
      })
      )
    );

    this.storeImage$ = this.store.pipe(
      select(getStoreImage)
    );

    this.storeLogo$ = this.store.pipe(
      select(getStoreLogo)
    );
  }

  onUpdate(form: ClientStoreRequest) {
    this.store.dispatch(new UpdateStore(form));

  }

  onStoreImageUpload(file: File) {
    this.store.dispatch(new UploadStoreImage(file));
  }

  onStoreLogoUpload(file: File) {
    this.store.dispatch(new UploadStoreLogo(file));
  }

  onStoreRemovePics(type: any) {
    if (type) {
      this.store.dispatch(new RemoveStoreLogo(this.storeId));
    } else {
      this.store.dispatch(new RemoveStoreImage(this.storeId));
    }
  }

}
