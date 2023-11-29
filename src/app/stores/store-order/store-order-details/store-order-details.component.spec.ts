import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreOrderDetailsComponent } from './store-order-details.component';
import { EnumPipe } from 'src/app/shared/enum.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { LocalizedDatePipe } from 'src/app/shared/localized-date.pipe';
import { MatDialog } from '@angular/material/dialog';


describe('StoreOrderDetailsComponent', () => {
  let component: StoreOrderDetailsComponent;
  let fixture: ComponentFixture<StoreOrderDetailsComponent>;
  const storeMock = {
    pipe() {
      return of({ });
    }
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreOrderDetailsComponent, EnumPipe, LocalizedDatePipe ],
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
        schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    const order = {};

    fixture = TestBed.createComponent(StoreOrderDetailsComponent);
    component = fixture.componentInstance;
    component.order = order;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
