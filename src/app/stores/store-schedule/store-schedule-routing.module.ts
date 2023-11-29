import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScheduleItemComponent } from './schedule-item/schedule-item.component';
import { ScheduleItemGuard } from './schedule-item/schedule-item.guard';
import { StoreSchedulesComponent } from './store-schedules/store-schedules.component';
import { StoreSchedulesGuard } from './store-schedules/store-schedules.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreSchedulesComponent, canActivate: [StoreSchedulesGuard]},
  { path: ':scheduleId', component: ScheduleItemComponent, canActivate: [ScheduleItemGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StoreScheduleRoutingModule { }
