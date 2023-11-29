import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreUsersComponent } from './store-users.component';
import { PagerComponent } from 'src/app/shared/pager/pager.component';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StoreUsersComponent', () => {
  let component: StoreUsersComponent;
  let fixture: ComponentFixture<StoreUsersComponent>;
  const storeMock = {
    pipe() {
      return of({ registrationStatus: '' });
    }
  };

  beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StoreUsersComponent, PagerComponent],
        providers: [
          {
            provide: Store,
            useValue: storeMock
          },
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: MatDialog, useClass: MatDialogMock },
          {
            provide: ActivatedRoute,
            useValue: {
              params: of({ id: 123 })
            }
          },
        ],
        imports: [ToastrModule.forRoot(),
          RouterTestingModule,
          HttpClientTestingModule,
          TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (http: HttpClient) => new TranslateHttpLoader(http, 'src/assets/translations/i18n/admin-translation.', '.json'),
                deps: [HttpClient]
            }
          }), ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
      fixture = TestBed.createComponent(StoreUsersComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

export class MatDialogMock {
  open() {
    return {
      afterClosed: () => of({ name: 'some object' })
    };
  }
}
