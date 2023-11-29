import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegistrationLoginDetailsFormComponent } from './registration-login-details-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Store } from '@ngrx/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import {SocialAuthService} from 'angularx-social-login';

describe('RegistrationLoginDetailsFormComponent', () => {
  let component: RegistrationLoginDetailsFormComponent;
  let fixture: ComponentFixture<RegistrationLoginDetailsFormComponent>;
  const storeMock = {
    pipe() {
      return of({ registrationStatus: '' });
    }
  };

  const authServiceMock = {
    signIn() {
      return Promise.resolve({
        googleAccount: {
          email: 'joe_doe@email.com',
          firstName: 'Joe',
          lastName: 'Doe',
          picture: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'
        }
      });
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrationLoginDetailsFormComponent ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/translations/i18n/admin-translation.', '.json'),
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        },
        {
          provide: SocialAuthService,
          useValue: authServiceMock
        },
        FormBuilder
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(RegistrationLoginDetailsFormComponent);
    component = fixture.componentInstance;
    component.newLoginDetails = {
      email: '',
      password: ''
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
