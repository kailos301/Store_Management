import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { StoreService } from './store.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

describe('StoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({imports: [HttpClientTestingModule] }));

  it('should be created', () => {
    const service: StoreService = TestBed.inject(StoreService);
    expect(service).toBeTruthy();
  });
});
