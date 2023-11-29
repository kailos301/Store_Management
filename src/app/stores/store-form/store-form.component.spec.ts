import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreFormComponent } from './store-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { AccountService } from 'src/app/account/account.service';
describe('StoreFormComponent', () => {
  let component: StoreFormComponent;
  let fixture: ComponentFixture<StoreFormComponent>;

  const storeMock = {
    pipe() {
      return of({});
    },
    dispatch() {
      return of({});
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreFormComponent ],
      imports: [HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/translations/i18n/admin-translation.', '.json'),
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        FormBuilder,
        AccountService,
        {
          provide: Store,
          useValue: storeMock
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(StoreFormComponent);
    component = fixture.componentInstance;
    component.store$ = of({
      name: '',
      description: '',
      aliasName: '',
      externalId: '',
      longitude: null,
      latitude: null,
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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
