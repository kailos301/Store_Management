import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ChildOfferComponent } from './child-offer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatDialog } from '@angular/material/dialog';

describe('ChildOfferComponent', () => {
  let component: ChildOfferComponent;
  let fixture: ComponentFixture<ChildOfferComponent>;

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
      declarations: [ ChildOfferComponent ],
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
        { provide: MatDialog, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ChildOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
