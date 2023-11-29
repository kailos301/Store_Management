import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {SocialAuthService} from 'angularx-social-login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const storeMock = {
    pipe() {
      return of({ });
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
      declarations: [ LoginComponent ],
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
        },
        {
          provide: SocialAuthService,
          useValue: authServiceMock
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
