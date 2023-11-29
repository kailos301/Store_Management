import { Action } from '@ngrx/store';

export enum MenuActionType {
    AddNavItem = '[menu] AddNavItem'
}

export class AddNavItem implements Action {
    readonly type = MenuActionType.AddNavItem;

    constructor() {}

}

export type MenuAction = AddNavItem;
