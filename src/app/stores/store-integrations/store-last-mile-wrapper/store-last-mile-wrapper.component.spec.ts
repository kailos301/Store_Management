import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { of } from 'rxjs';

import { StoreLastMileWrapperComponent } from './store-last-mile-wrapper.component';

describe('StoreLastMileWrapperComponent', () => {
  let component: StoreLastMileWrapperComponent;
  let fixture: ComponentFixture<StoreLastMileWrapperComponent>;

  const storeMock = {
    pipe() {
      return of({
        settings: {
          DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID: 'Test',
          DELIVERY_PROVIDER_MYNEXT_API_KEY: 'Test',
          DELIVERY_PROVIDER_MYNEXT_ENABLE: true
        }
      });
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StoreLastMileWrapperComponent],
      providers: [
        FormBuilder,
        {
          provide: Store,
          useValue: storeMock
        }
      ],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/translations/i18n/admin-translation.', '.json'),
            deps: [HttpClient]
          }
        })],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreLastMileWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
