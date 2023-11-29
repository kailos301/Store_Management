import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  Schedule
} from './stores-schedule';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoresScheduleService {

  constructor(private http: HttpClient) { }

  getAllSchedules(id: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`/api/v1/stores/${id}/schedules`);
  }

  addSchedule(schedule: Schedule, storeId: number): Observable<Schedule> {
    return this.http.post<Schedule>(`/api/v1/stores/${storeId}/schedules`, schedule);
  }

  updateSchedule(schedule: Schedule, storeId: number): Observable<Schedule> {
    return this.http.put<Schedule>(`/api/v1/stores/${storeId}/schedules/${schedule.id}`, schedule);
  }

  getSchedule(scheduleId: number, storeId: number) {
    return this.http.get<Schedule>(`/api/v1/stores/${storeId}/schedules/${scheduleId}`);
  }

  deleteSchedule(scheduleId: number, storeId: number) {
    return this.http.delete<any>(`/api/v1/stores/${storeId}/schedules/${scheduleId}`);
  }

  getSpecialSchedule(specialScheduleType: string, storeId: number) {
    return this.http.get<any>(`/api/v1/stores/${storeId}/schedules/special?type=${specialScheduleType}`);
  }

  addSpecialSchedule(specialScheduleType: string, scheduleId: number, storeId: number) {
    return this.http.post<any>(`/api/v1/stores/${storeId}/schedules/special`, {type: specialScheduleType, scheduleId});
  }

  updateSpecialSchedule(specialScheduleId: number, specialScheduleType: string, scheduleId: number, storeId: number) {
    return this.http.put<any>(`/api/v1/stores/${storeId}/schedules/special/${specialScheduleId}`, {type: specialScheduleType, scheduleId});
  }

  deleteSpecialSchedule(specialScheduleId: number, storeId: number) {
    return this.http.delete<any>(`/api/v1/stores/${storeId}/schedules/special/${specialScheduleId}`);
  }
}
