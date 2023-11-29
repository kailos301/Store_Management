import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreOrderViewComponent } from './store-order-view.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('StoreOrderViewComponent', () => {
  let component: StoreOrderViewComponent;
  let fixture: ComponentFixture<StoreOrderViewComponent>;

  const storeMock = {
    pipe() {
      return of({});
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreOrderViewComponent ],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(StoreOrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
