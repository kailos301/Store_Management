import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('AuthService', () => {

  const storeMock = {
    select() {
      return of({ });
    }
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      {
        provide: Store,
        useValue: storeMock
      }
    ]
  }));

  it('should be created', () => {
    const service: AuthService = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });
});
