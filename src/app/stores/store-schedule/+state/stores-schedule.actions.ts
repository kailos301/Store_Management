import { Action } from '@ngrx/store';
import { Schedule, SpecialSchedule } from '../stores-schedule';

export enum StoreScheduleActionType {
  LoadSchedules = '[storeSchedules] LoadSchedules',
  LoadSchedulesSuccess = '[storeSchedules] LoadSchedulesSuccess',
  LoadSchedulesFailed = '[storeSchedules] LoadSchedulesFailed',
  CreateSchedule = '[storeSchedules] CreateSchedule',
  CreateScheduleSuccess = '[storeSchedules] CreateScheduleSuccess',
  CreateScheduleFailed = '[storeSchedules] CreateScheduleFailed',
  UpdateSchedule = '[storeSchedules] UpdateSchedule',
  UpdateScheduleSuccess = '[storeSchedules] UpdateScheduleSuccess',
  UpdateScheduleFailed = '[storeSchedules] UpdateScheduleFailed',
  LoadSchedule = '[storeSchedules] LoadSchedule',
  LoadScheduleSuccess = '[storeSchedules] LoadScheduleSuccess',
  LoadScheduleFailed = '[storeSchedules] LoadScheduleFailed',
  DeleteSchedule = '[storeSchedules] DeleteSchedule',
  DeleteScheduleSuccess = '[storeSchedules] DeleteScheduleSuccess',
  DeleteScheduleFailed = '[storeSchedules] DeleteScheduleFailed',
  CreateSpecialSchedule = '[storeSchedules] CreateSpecialSchedule',
  CreateOpeningScheduleSuccess = '[storeSchedules] CreateOpeningScheduleSuccess',
  CreateAddressDeliveryScheduleSuccess = '[storeSchedules] CreateAddressDeliveryScheduleSuccess',
  CreatePickupScheduleSuccess = '[storeSchedules] CreatePickupScheduleSuccess',
  CreateServingScheduleSuccess = '[storeSchedules] CreateServingScheduleSuccess',
  CreateSpecialScheduleFailed = '[storeSchedules] CreateSpecialScheduleFailed',
  UpdateSpecialSchedule = '[storeSchedules] UpdateSpecialSchedule',
  UpdateSpecialScheduleSuccess = '[storeSchedules] UpdateSpecialScheduleSuccess',
  UpdateSpecialScheduleFailed = '[storeSchedules] UpdateSpecialScheduleFailed',
  LoadSpecialSchedule = '[storeSchedules] LoadSpecialSchedule',
  LoadOpeningScheduleSuccess = '[storeSchedules] LoadOpeningScheduleSuccess',
  LoadAddressDeliveryScheduleSuccess = '[storeSchedules] LoadAddressDeliveryScheduleSuccess',
  LoadPickupScheduleSuccess = '[storeSchedules] LoadPickupScheduleSuccess',
  LoadServingScheduleSuccess = '[storeSchedules] LoadServingScheduleSuccess',
  LoadOpeningSchedule = '[storeSchedules] LoadOpeningSchedule',
  LoadAddressDeliverySchedule = '[storeSchedules] LoadAddressDeliverySchedule',
  LoadPickupSchedule = '[storeSchedules] LoadPickupSchedule',
  LoadServingSchedule = '[storeSchedules] LoadServingSchedule',
  LoadSpecialScheduleFailed = '[storeSchedules] LoadSpecialScheduleFailed',
  DeleteSpecialSchedule = '[storeSchedules] DeleteSpecialSchedule',
  DeleteOpeningScheduleSuccess = '[storeSchedules] DeleteOpeningScheduleSuccess',
  DeleteAddressDeliveryScheduleSuccess = '[storeSchedules] DeleteAddressDeliveryScheduleSuccess',
  DeletePickupScheduleSuccess = '[storeSchedules] DeletePickupScheduleSuccess',
  DeleteServingScheduleSuccess = '[storeSchedules] DeleteServingScheduleSuccess',
  DeleteSpecialScheduleFailed = '[storeSchedules] DeleteSpecialScheduleFailed'
}

export class LoadSchedules implements Action {
  readonly type = StoreScheduleActionType.LoadSchedules;
  constructor(public readonly id: number) { }
}

export class LoadSchedulesSuccess implements Action {
  readonly type = StoreScheduleActionType.LoadSchedulesSuccess;
  constructor(public readonly schedules: Schedule[]) { }
}

export class LoadSchedulesFailed implements Action {
  readonly type = StoreScheduleActionType.LoadSchedulesFailed;
  constructor(public readonly errors: string[]) { }
}

export class CreateSchedule implements Action {
  readonly type = StoreScheduleActionType.CreateSchedule;
  constructor(public readonly schedule: Schedule, public readonly storeId: number) { }
}

export class CreateScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.CreateScheduleSuccess;
  constructor(public readonly schedule: Schedule, storeId: number) { }
}

export class CreateScheduleFailed implements Action {
  readonly type = StoreScheduleActionType.CreateScheduleFailed;
  constructor(public readonly errors: string[]) { }
}

export class UpdateSchedule implements Action {
  readonly type = StoreScheduleActionType.UpdateSchedule;
  constructor(public readonly schedule: Schedule, public readonly scheduleId: number, public readonly storeId: number) { }
}

export class UpdateScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.UpdateScheduleSuccess;
  constructor(public readonly schedule: Schedule) { }
}

export class UpdateScheduleFailed implements Action {
  readonly type = StoreScheduleActionType.UpdateScheduleFailed;
  constructor(public readonly errors: string[]) { }
}

export class LoadSchedule implements Action {
  readonly type = StoreScheduleActionType.LoadSchedule;
  constructor(public readonly scheduleId: number, public readonly storeId: number) { }
}

export class LoadScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.LoadScheduleSuccess;
  constructor(public readonly schedule: Schedule) { }
}

export class LoadScheduleFailed implements Action {
  readonly type = StoreScheduleActionType.LoadScheduleFailed;
  constructor(public readonly errors: string[]) { }
}

export class DeleteSchedule implements Action {
  readonly type = StoreScheduleActionType.DeleteSchedule;
  constructor(public readonly scheduleId: number, public readonly storeId: number) { }
}

export class DeleteScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.DeleteScheduleSuccess;
  constructor(public readonly storeId: number) { }
}

export class DeleteScheduleFailed implements Action {
  readonly type = StoreScheduleActionType.DeleteScheduleFailed;
  constructor(public readonly errors: string[]) { }
}

export class CreateSpecialSchedule implements Action {
  readonly type = StoreScheduleActionType.CreateSpecialSchedule;
  constructor(public readonly specialScheduleType: string, public readonly scheduleId: number, public readonly storeId: number) { }
}

export class CreateOpeningScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.CreateOpeningScheduleSuccess;
  constructor(public readonly openingSchedule: SpecialSchedule) { }
}
export class CreateAddressDeliveryScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.CreateAddressDeliveryScheduleSuccess;
  constructor(public readonly addressDeliverySchedule: SpecialSchedule) { }
}
export class CreatePickupScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.CreatePickupScheduleSuccess;
  constructor(public readonly pickupSchedule: SpecialSchedule) { }
}
export class CreateServingScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.CreateServingScheduleSuccess;
  constructor(public readonly servingSchedule: SpecialSchedule) { }
}

export class CreateSpecialScheduleFailed implements Action {
  readonly type = StoreScheduleActionType.CreateSpecialScheduleFailed;
  constructor(public readonly errors: string[]) { }
}

export class UpdateSpecialSchedule implements Action {
  readonly type = StoreScheduleActionType.UpdateSpecialSchedule;
  constructor(
    public readonly specialScheduleId: number,
    public readonly specialScheduleType: string,
    public readonly scheduleId: number,
    public readonly storeId: number,
  ) {}
}

export class UpdateSpecialScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.UpdateSpecialScheduleSuccess;
  constructor() { }
}

export class UpdateSpecialScheduleFailed implements Action {
  readonly type = StoreScheduleActionType.UpdateSpecialScheduleFailed;
  constructor(public readonly errors: string[]) { }
}

export class LoadSpecialSchedule implements Action {
  readonly type = StoreScheduleActionType.LoadSpecialSchedule;
  constructor(public readonly specialScheduleType: string, public readonly storeId: number) { }
}
export class LoadOpeningSchedule implements Action {
  readonly type = StoreScheduleActionType.LoadOpeningSchedule;
  constructor(public readonly specialScheduleType: string, public readonly storeId: number) { }
}
export class LoadAddressDeliverySchedule implements Action {
  readonly type = StoreScheduleActionType.LoadAddressDeliverySchedule;
  constructor(public readonly specialScheduleType: string, public readonly storeId: number) { }
}
export class LoadPickupSchedule implements Action {
  readonly type = StoreScheduleActionType.LoadPickupSchedule;
  constructor(public readonly specialScheduleType: string, public readonly storeId: number) { }
}
export class LoadServingSchedule implements Action {
  readonly type = StoreScheduleActionType.LoadServingSchedule;
  constructor(public readonly specialScheduleType: string, public readonly storeId: number) { }
}
export class LoadOpeningScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.LoadOpeningScheduleSuccess;
  constructor(public readonly openingSchedule: SpecialSchedule[]) { }
}
export class LoadAddressDeliveryScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.LoadAddressDeliveryScheduleSuccess;
  constructor(public readonly addressDeliverySchedule: SpecialSchedule[]) { }
}
export class LoadPickupScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.LoadPickupScheduleSuccess;
  constructor(public readonly pickupSchedule: SpecialSchedule[]) { }
}
export class LoadServingScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.LoadServingScheduleSuccess;
  constructor(public readonly servingSchedule: SpecialSchedule[]) { }
}

export class LoadSpecialScheduleFailed implements Action {
  readonly type = StoreScheduleActionType.LoadSpecialScheduleFailed;
  constructor(public readonly errors: string[]) { }
}

export class DeleteSpecialSchedule implements Action {
  readonly type = StoreScheduleActionType.DeleteSpecialSchedule;
  constructor(public readonly specialType: string, public readonly specialScheduleId: number, public readonly storeId: number) { }
}

export class DeleteOpeningScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.DeleteOpeningScheduleSuccess;
  constructor() { }
}
export class DeleteAddressDeliveryScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.DeleteAddressDeliveryScheduleSuccess;
  constructor() { }
}
export class DeletePickupScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.DeletePickupScheduleSuccess;
  constructor() { }
}
export class DeleteServingScheduleSuccess implements Action {
  readonly type = StoreScheduleActionType.DeleteServingScheduleSuccess;
  constructor() { }
}

export class DeleteSpecialScheduleFailed implements Action {
  readonly type = StoreScheduleActionType.DeleteSpecialScheduleFailed;
  constructor(public readonly errors: string[]) { }
}
export type StoresAction =
  LoadSchedules
  | LoadSchedulesSuccess
  | LoadSchedulesFailed
  | CreateSchedule
  | CreateScheduleSuccess
  | CreateScheduleFailed
  | UpdateSchedule
  | UpdateScheduleSuccess
  | UpdateScheduleFailed
  | LoadSchedule
  | LoadScheduleSuccess
  | LoadScheduleFailed
  | DeleteSchedule
  | DeleteScheduleSuccess
  | DeleteScheduleFailed
  | CreateSpecialSchedule
  | CreateOpeningScheduleSuccess
  | CreateAddressDeliveryScheduleSuccess
  | CreatePickupScheduleSuccess
  | CreateServingScheduleSuccess
  | CreateSpecialScheduleFailed
  | UpdateSpecialSchedule
  | UpdateSpecialScheduleSuccess
  | UpdateSpecialScheduleFailed
  | LoadSpecialSchedule
  | LoadOpeningSchedule
  | LoadAddressDeliverySchedule
  | LoadPickupSchedule
  | LoadServingSchedule
  | LoadOpeningScheduleSuccess
  | LoadAddressDeliveryScheduleSuccess
  | LoadPickupScheduleSuccess
  | LoadServingScheduleSuccess
  | LoadSpecialScheduleFailed
  | DeleteSpecialSchedule
  | DeleteOpeningScheduleSuccess
  | DeleteAddressDeliveryScheduleSuccess
  | DeletePickupScheduleSuccess
  | DeleteServingScheduleSuccess
  | DeleteSpecialScheduleFailed;
