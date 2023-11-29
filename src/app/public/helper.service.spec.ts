import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { HelperService } from './helper.service';
import { InjectionToken } from '@angular/core';
import { WINDOW } from './window-providers';
import { of } from 'rxjs';

describe('HelperService', () => {
  const storeMock = {
    pipe() {
      return of({});
    }
  };
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: Store,
        useValue: storeMock
      },
      {
        provide: WINDOW, useValue: {}
      }
    ]
  }));

  it('should be created', () => {
    const service: HelperService = TestBed.inject(HelperService);
    expect(service).toBeTruthy();
  });
});
