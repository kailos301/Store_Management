import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { RouterTestingModule } from '@angular/router/testing';

describe('LanguageService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      HttpClientTestingModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/translations/i18n/admin-translation.', '.json'),
          deps: [HttpClient]
        }
  })],

  }));

  it('should be created', () => {
    const service: LanguageService = TestBed.inject(LanguageService);
    expect(service).toBeTruthy();
  });
});
