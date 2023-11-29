import { StoresState } from './../+state/stores.reducer';
import { ClientStoreRequest } from './../stores';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CreateStore } from '../+state/stores.actions';
import { Subscription, Observable, of } from 'rxjs';
import { helpPage } from 'src/app/shared/help-page.const';

@Component({
  selector: 'app-store-create',
  templateUrl: './store-create.component.html',
  styleUrls: ['./store-create.component.scss']
})
export class StoreCreateComponent implements OnInit {

  storeCreation$: Observable<ClientStoreRequest>;
  registerHelpPage = helpPage.register;

  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    this.storeCreation$ = of({
      name: '',
      description: '',
      aliasName: '',
      externalId: 'NA',
      longitude: -1,
      latitude: -1,
      countryId: null,
      languageId: null,
      addressLine1: '',
      addressLine2: '',
      postCode: '',
      region: '',
      city: '',
      phoneCountryCode: '',
      phoneNumber: '',
      timeZone: ''
    });



  }

  onCreate(form: ClientStoreRequest) {
    this.store.dispatch(new CreateStore(form));
  }

}
