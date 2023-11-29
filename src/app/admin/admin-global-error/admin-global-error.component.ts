import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isNewVersionAvailable } from 'src/app/application-state/+state/application-state.selectors';
import { GlobalErrorService } from 'src/app/error/global-error.service';
import { LogService } from 'src/app/shared/logging/LogService';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';

@Component({
  selector: 'app-admin-global-error',
  templateUrl: './admin-global-error.component.html',
  styleUrls: ['./admin-global-error.component.scss']
})
export class AdminGlobalErrorComponent implements OnInit, OnDestroy {

  error: any;
  isStagingEnv = false;
  outletError: any;
  angularError: any;
  accessDenied: boolean;
  isNewVersionAvailable$: Observable<boolean>;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private errorService: GlobalErrorService, private logger: LogService, private store: Store<any>) { }

  ngOnInit() {
    this.isStagingEnv = this.errorService.isStagingEnv;
    this.error = this.errorService.currentError;
    this.outletError = this.errorService.outletRouteData;
    this.angularError = this.errorService.currentAngularError;
    this.accessDenied = this.errorService.isAccessDenied;

    this.isNewVersionAvailable$ = this.store.pipe(select(isNewVersionAvailable));

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.unsubscribe$),
    ).subscribe(s => {
      if (!!s && (s.id !== -1 || !!s.aliasName)) {
        const storeDetails = `Store id: ${s.id}, Store alias: ${s.aliasName}`;
        this.logger.error('admin ui error', storeDetails, this.error, this.outletError, this.angularError);
      } else {
        this.logger.error('admin ui error', this.error, this.outletError, this.angularError);
      }
    });

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
