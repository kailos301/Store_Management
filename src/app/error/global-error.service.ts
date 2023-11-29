import { Injectable, NgZone } from '@angular/core';
import { WindowRefService } from 'src/app/window.service';
import { environment } from '../../environments/environment';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Store, Action } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorService {

  private currentHttpError: any;
  private actualAngularError: any;
  private isStaging: boolean;
  private outletData: ActivatedRouteSnapshot;
  private accessDenied: boolean;

  constructor(private windowRefSer: WindowRefService, private store: Store<any>, private router: Router, private zone: NgZone) { }

  dispatchErrorAction(action: Action) {
    this.store.dispatch(action);
  }

  navigateToErrorPage(errorPage: string[]) {
    this.zone.run(() => this.router.navigate(errorPage, { skipLocationChange: true }));
  }

  get currentError() {
    return !!this.currentHttpError ? this.currentHttpError : '';
  }
  set currentError(error: any) {
    this.currentHttpError = error;
  }
  get currentAngularError() {
    return !!this.actualAngularError ? this.actualAngularError : '';
  }
  set currentAngularError(angularError: any) {
    this.actualAngularError = angularError;
  }
  get isAccessDenied() {
    return this.accessDenied;
  }
  set isAccessDenied(accessDenied: boolean) {
    this.accessDenied = accessDenied;
  }
  get isStagingEnv() {
    this.isStaging = this.windowRefSer.nativeWindowLocation.hostname.includes(environment.stagingHost)
                      || this.windowRefSer.nativeWindowLocation.hostname.includes('localhost');
    return this.isStaging;
  }
  get outletRouteData() {
    return this.outletData && this.outletData.data && this.outletData.data.error;
  }
  set outletRouteData(outletData) {
    this.outletData = outletData;
  }
}
