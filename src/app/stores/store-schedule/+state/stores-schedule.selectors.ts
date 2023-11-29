import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Schedules } from './stores-schedule.reducer';

export const getSchedulesState = createFeatureSelector<Schedules>('schedules');
export const getAllSchedules = createSelector(getSchedulesState, (state: Schedules) => state.schedulelist.data);
export const getSelectedSchedule = createSelector(getSchedulesState, (state: Schedules) => state.selectedSchedule.data);
export const getSelectedScheduleStatus = createSelector(getSchedulesState, (state: Schedules) => state.selectedSchedule.status);
export const getOpeningSchedule = createSelector(getSchedulesState, (state: Schedules) => state.openingSchedule);
export const getAddressDeliverySchedule = createSelector(getSchedulesState, (state: Schedules) => state.addressDeliverySchedule);
export const getPickupSchedule = createSelector(getSchedulesState, (state: Schedules) => state.pickupSchedule);
export const getServingSchedule = createSelector(getSchedulesState, (state: Schedules) => state.servingSchedule);
