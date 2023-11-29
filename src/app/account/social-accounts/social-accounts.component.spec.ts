import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {SocialAccountsComponent} from './social-accounts.component';
import {SocialAuthService} from 'angularx-social-login';

describe('SocialAccountsComponent', () => {
  let component: SocialAccountsComponent;
  let fixture: ComponentFixture<SocialAccountsComponent>;

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
      declarations: [ SocialAccountsComponent ],
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
    fixture = TestBed.createComponent(SocialAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
