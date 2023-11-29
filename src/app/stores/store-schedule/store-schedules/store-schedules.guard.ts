import { take } from 'rxjs/operators';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadSchedules, LoadSpecialSchedule } from '../+state/stores-schedule.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreSchedulesGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.parent.parent.params.id;
    this.store.dispatch(new LoadSchedules(id));
    return true;
  }

}
