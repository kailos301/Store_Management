import { take } from 'rxjs/operators';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadSchedule, LoadSchedules, LoadScheduleSuccess } from '../+state/stores-schedule.actions';

@Injectable({
    providedIn: 'root'
})
export class ScheduleItemGuard implements CanActivate {

    constructor(private store: Store<any>) { }

    canActivate(route: ActivatedRouteSnapshot) {
        const id = route.parent.parent.params.id;
        const scheduleId = route.params.scheduleId;

        if (scheduleId === 'create') {
            this.store.dispatch(new LoadScheduleSuccess({
                id: -1,
                name: '',
                availabilities: [{
                    id: new Date().valueOf(),
                    startTime: '',
                    endTime: '',
                    daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
                }]
            }));
        } else {
            this.store.dispatch(new LoadSchedule(+scheduleId, +id));
        }
        return true;
    }

}
