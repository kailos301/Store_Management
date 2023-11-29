import { UserProfile } from '../../api/types/User';
import { Action } from '@ngrx/store';

export enum AccountActionType {
    GetUser = '[account] GetUser',
    GetUserSuccess = '[account] GetUserSuccess',
    GetUserFailed = '[account] GetUserFailed',
    UpdateUser = '[account] UpdateUser',
    UpdateUserSuccess = '[account] UpdateUserSuccess',
    UpdateUserFailed = '[account] UpdateUserFailed',
    UpdateUserEmail = '[account] UpdateUserEmail',
    ChangePassword = '[account] ChangePassword',
    ChangePasswordSuccess = '[account] ChangePasswordSuccess',
    ChangePasswordFailed = '[account] ChangePasswordFailed',
    CreatePassword = '[account] CreatePassword',
    CreatePasswordSuccess = '[account] CreatePasswordSuccess',
    CreatePasswordFailed = '[account] CreatePasswordFailed',
    LinkSocialAccount = '[account] LinkSocialAccount',
    LinkSocialAccountSuccess = '[account] LinkSocialAccountSuccess',
    LinkSocialAccountFailed = '[account] LinkSocialAccountFailed',
    SendEmail = '[account] SendEmail',
    SendEmailSuccess = '[account] SendEmailSuccess',
    SendEmailFailed = '[account] SendEmailFailed',
    DeleteUser = '[account] DeleteUser',
    DeleteUserFailed = '[account] DeleteUserFailed',
    DeleteUserSuccess = '[account] DeleteUserSuccess'
}

export class GetUser implements Action {
    readonly type = AccountActionType.GetUser;

    constructor() {}

}

export class GetUserSuccess implements Action {
    readonly type = AccountActionType.GetUserSuccess;

    constructor(public readonly user: UserProfile) {}

}

export class GetUserFailed implements Action {
    readonly type = AccountActionType.GetUserFailed;

    constructor() {}

}

export class UpdateUser implements Action {
    readonly type = AccountActionType.UpdateUser;

    constructor(public readonly user: UserProfile) {}

}

export class UpdateUserSuccess implements Action {
    readonly type = AccountActionType.UpdateUserSuccess;

    constructor(public readonly user: UserProfile) {}

}

export class UpdateUserFailed implements Action {
    readonly type = AccountActionType.UpdateUserFailed;

    constructor(public readonly errors: string[]) {}

}

export class UpdateUserEmail implements Action {
    readonly type = AccountActionType.UpdateUserEmail;

    constructor() {}

}

export class ChangePassword implements Action {
    readonly type = AccountActionType.ChangePassword;

    constructor(public readonly password: string, public readonly newPassword: string) {}

}

export class ChangePasswordSuccess implements Action {
    readonly type = AccountActionType.ChangePasswordSuccess;

    constructor() {}

}

export class ChangePasswordFailed implements Action {
    readonly type = AccountActionType.ChangePasswordFailed;

    constructor(public readonly errors: string[]) {}

}

export class CreatePassword implements Action {
  readonly type = AccountActionType.CreatePassword;

  constructor(public readonly newPassword: string) {}

}

export class CreatePasswordSuccess implements Action {
  readonly type = AccountActionType.CreatePasswordSuccess;

  constructor() {}

}

export class CreatePasswordFailed implements Action {
  readonly type = AccountActionType.CreatePasswordFailed;

  constructor(public readonly errors: string[]) {}

}

export class LinkSocialAccount implements Action {
  readonly type = AccountActionType.LinkSocialAccount;

  constructor(public readonly accessToken: string, public readonly authProvider: string, public readonly appleCode?: string) {}
}

export class LinkSocialAccountSuccess implements Action {
  readonly type = AccountActionType.LinkSocialAccountSuccess;

  constructor() {}
}

export class LinkSocialAccountFailed implements Action {
  readonly type = AccountActionType.LinkSocialAccountFailed;

  constructor(public readonly errors: string[]) {}
}

export class SendEmail implements Action {
    readonly type = AccountActionType.SendEmail;

    constructor(public readonly message: string) {}

}

export class SendEmailSuccess implements Action {
    readonly type = AccountActionType.SendEmailSuccess;

    constructor() {}

}

export class SendEmailFailed implements Action {
    readonly type = AccountActionType.SendEmailFailed;

    constructor(public readonly errors: string[]) {}

}

export class DeleteUser implements Action {
    readonly type = AccountActionType.DeleteUser;

    constructor(public readonly userId: number) {}

}
export class DeleteUserSuccess implements Action {
    readonly type = AccountActionType.DeleteUserSuccess;

    constructor() {}

}
export class DeleteUserFailed implements Action {
    readonly type = AccountActionType.DeleteUserFailed;

    constructor() {}

}
// vouchers


export type AccountAction =
    GetUser
    | GetUserSuccess
    | GetUserFailed
    | UpdateUser
    | UpdateUserSuccess
    | UpdateUserFailed
    | UpdateUserEmail
    | ChangePassword
    | ChangePasswordSuccess
    | ChangePasswordFailed
    | CreatePassword
    | CreatePasswordSuccess
    | CreatePasswordFailed
    | LinkSocialAccount
    | LinkSocialAccountSuccess
    | LinkSocialAccountFailed
    | SendEmail
    | SendEmailSuccess
    | SendEmailFailed
    | DeleteUserFailed
    | DeleteUserSuccess
    | DeleteUser;
