import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountVerificationComponent } from './account-verification.component';
import { EmailFormComponent } from '../email-form/email-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AccountVerificationComponent', () => {
  let component: AccountVerificationComponent;
  let fixture: ComponentFixture<AccountVerificationComponent>;

  const storeMock = {
    select() {
      return of({ });
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountVerificationComponent, EmailFormComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
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
        {
          provide: Store,
          useValue: storeMock
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AccountVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
