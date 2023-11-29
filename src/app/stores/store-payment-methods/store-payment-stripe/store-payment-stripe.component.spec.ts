import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StorePaymentStripeComponent } from './store-payment-stripe.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StorePaymentStripeComponent', () => {
  let component: StorePaymentStripeComponent;
  let fixture: ComponentFixture<StorePaymentStripeComponent>;

  const storeMock = {
    pipe() {
      return of({});
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StorePaymentStripeComponent ],
      imports: [
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
        {
          provide: Store,
          useValue: storeMock
        }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(StorePaymentStripeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
