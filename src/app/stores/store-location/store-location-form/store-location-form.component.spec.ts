import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreLocationFormComponent } from './store-location-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('StoreLocationFormComponent', () => {
  let component: StoreLocationFormComponent;
  let fixture: ComponentFixture<StoreLocationFormComponent>;
  const storeMock = {
    pipe() {
      return of({});
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreLocationFormComponent ],
      providers: [FormBuilder,
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
    fixture = TestBed.createComponent(StoreLocationFormComponent);
    component = fixture.componentInstance;
    component.location = {
      label: ''
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
