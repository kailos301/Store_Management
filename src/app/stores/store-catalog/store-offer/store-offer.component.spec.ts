import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreOfferComponent } from './store-offer.component';
import { FormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';

describe('StoreOfferComponent', () => {
  let component: StoreOfferComponent;
  let fixture: ComponentFixture<StoreOfferComponent>;
  const actionMock = {
    pipe() {
      return of({});
    }
  };

  const storeMock = {
    pipe() {
      return of({
        id: -1,
        name: '',
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
          }
        },
        phoneNumber: '',
        language: {
          id: null,
          name: '',
          locale: '',
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
        timeZone: ''
      });
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreOfferComponent ],
      imports: [RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/translations/i18n/admin-translation.', '.json'),
            deps: [HttpClient]
          }
        })],
      providers: [
        FormBuilder,
        {
          provide: Store,
          useValue: storeMock
        },
        { provide: MatDialog, useValue: {} },
        { provide: Actions, useValue: actionMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(StoreOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
