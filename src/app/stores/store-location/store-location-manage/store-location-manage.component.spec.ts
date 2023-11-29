import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreLocationManageComponent } from './store-location-manage.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

describe('StoreLocationManageComponent', () => {
  let component: StoreLocationManageComponent;
  let fixture: ComponentFixture<StoreLocationManageComponent>;

  const storeMock = {
    pipe() {
      return of({});
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreLocationManageComponent ],
      imports:  [RouterTestingModule, HttpClientTestingModule,
        TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/translations/i18n/admin-translation.', '.json'),
          deps: [HttpClient]
        }
      })],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(StoreLocationManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
