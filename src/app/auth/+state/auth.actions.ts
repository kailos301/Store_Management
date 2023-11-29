import {SocialAccountLoginDetails, UserProfile, UserRegistrationDetails} from './../../api/types/User';
import { Action } from '@ngrx/store';
import { LoginResponse, Tokens, LoggedInUser, LocationInfo } from '../auth';

export enum AuthActionType {
  InitializeLoginState = '[auth] InitializeLoginState',
  Login = '[auth] Login',
  SocialLogin = '[auth] SocialLogin',
  PartnerSocialLogin = '[auth] PartnerSocialLogin',
  InvitationSocialLogin = '[auth] InvitationSocialLogin',
  LoginSuccess = '[auth] LoginSuccess',
  RefreshTokenSuccess = '[auth] RefreshTokenSuccess',
  LoginFailed = '[auth] LoginFailed',
  SocialLoginFailed = '[auth] SocialLoginFailed',
  InitializePasswordAuthState = '[auth] InitializePasswordAuthState',
  PasswordAuth = '[auth] PasswordAuth',
  PasswordAuthSuccess = '[auth] PasswordAuthSuccess',
  PasswordAuthFailed = '[auth] PasswordAuthFailed',
  Logout = '[auth] Logout',
  LogoutSuccess = '[auth] LogoutSuccess',
  LogoutFailed = '[auth] LogoutFailed',
  InitializeRegistrationState = '[auth] InitializeRegistrationState',
  Register = '[auth] Register',
  RegisterLoginDetails = '[auth] RegisterLoginDetails',
  RegisterPartnerLoginDetails = '[auth] RegisterPartnerLoginDetails',
  RegisterByInvitationLoginDetails = '[auth] RegisterByInvitationLoginDetails',
  RegisterSuccess = '[auth] RegisterSuccess',
  RegisterFailed = '[auth] RegisterFailed',
  RegisterByInvitation = '[auth] RegisterByInvitation',
  RegisterByInvitationSuccess = '[auth] RegisterByInvitationSuccess',
  RegisterByInvitationFailed = '[auth] RegisterByInvitationFailed',
  VerifyAccount = '[auth] VerifyAccount',
  VerifyAccountSuccess = '[auth] VerifyAccountSuccess',
  VerifyAccountFailed = '[auth] VerifyAccountFailed',
  ResetPassword = '[auth] ResetPassword',
  ResetPasswordInitial = '[auth] ResetPasswordInitial',
  ResetPasswordSuccess = '[auth] ResetPasswordSuccess',
  ResetPasswordFailed = '[auth] ResetPasswordFailed',
  UserForToken = '[auth] UserForToken',
  UpdatePassword = '[auth] UpdatePassword',
  UpdatePasswordSuccess = '[auth] UpdatePasswordSuccess',
  UpdatePasswordFailed = '[auth] UpdatePasswordFailed',
  FetchLoggedInUser = '[auth] FetchLoggedInUser',
  FetchLoggedInUserSuccess = '[auth] FetchLoggedInUserSuccess',
  FetchLoggedInUserFailed = '[auth] FetchLoggedInUserFailed',
  RegisterPartner = '[auth] RegisterPartner',
  RegisterPartnerSuccess = '[auth] RegisterPartnerSuccess',
  RegisterPartnerFailed = '[auth] RegisterPartnerFailed',
  GetLocationInfo = '[auth] GetLocationInfo',
  GetLocationInfoSuccess = '[auth] GetLocationInfoSuccess',
  GetLocationInfoFailed = '[auth] GetLocationInfoFailed',
}

export class InitializeLoginState implements Action {
  readonly type = AuthActionType.InitializeLoginState;

  constructor() {}

}

export class Login implements Action {
  readonly type = AuthActionType.Login;

  constructor(public readonly username: string, public readonly password: string) {}

}

export class SocialLogin implements Action {
  readonly type = AuthActionType.SocialLogin;

  constructor(public readonly login: SocialAccountLoginDetails) {}
}

export class PartnerSocialLogin implements Action {
  readonly type = AuthActionType.PartnerSocialLogin;

  constructor(public readonly login: SocialAccountLoginDetails) {}
}

export class InvitationSocialLogin implements Action {
  readonly type = AuthActionType.InvitationSocialLogin;

  constructor(public readonly login: SocialAccountLoginDetails, public readonly token: string, public readonly store: string) {}
}

export class LoginSuccess implements Action {
  readonly type = AuthActionType.LoginSuccess;

  constructor(public readonly response: LoginResponse) {}

}

export class LoginFailed implements Action {
  readonly type = AuthActionType.LoginFailed;

  constructor() {}
}

export class SocialLoginFailed implements Action {
  readonly type = AuthActionType.SocialLoginFailed;

  constructor() {}
}

export class InitializePasswordAuthState implements Action {
  readonly type = AuthActionType.InitializePasswordAuthState;

  constructor() {}

}

export class PasswordAuth implements Action {
  readonly type = AuthActionType.PasswordAuth;

  constructor(public readonly username: string, public readonly password: string) {}

}

export class PasswordAuthSuccess implements Action {
  readonly type = AuthActionType.PasswordAuthSuccess;

  constructor(public readonly response: LoginResponse) {}

}

export class PasswordAuthFailed implements Action {
  readonly type = AuthActionType.PasswordAuthFailed;

  constructor() {}

}

export class RefreshTokenSuccess implements Action {
  readonly type = AuthActionType.RefreshTokenSuccess;

  constructor(public readonly tokens: Tokens) {}
}

export class Logout implements Action {
  readonly type = AuthActionType.Logout;

  constructor() {}
}

export class LogoutSuccess implements Action {
  readonly type = AuthActionType.LogoutSuccess;

  constructor() {}
}

export class LogoutFailed implements Action {
  readonly type = AuthActionType.LogoutFailed;

  constructor() {}
}


export class InitializeRegistrationState implements Action {
  readonly type = AuthActionType.InitializeRegistrationState;

  constructor() {}
}

export class Register implements Action {
  readonly type = AuthActionType.Register;

  constructor(public readonly registration: UserRegistrationDetails) {}
}

export class RegisterLoginDetails implements Action {
  readonly type = AuthActionType.RegisterLoginDetails;

  constructor(public readonly registration: UserRegistrationDetails) {}
}

export class RegisterPartnerLoginDetails implements Action {
  readonly type = AuthActionType.RegisterPartnerLoginDetails;

  constructor(public readonly registration: UserRegistrationDetails) {}
}

export class RegisterByInvitationLoginDetails implements Action {
  readonly type = AuthActionType.RegisterByInvitationLoginDetails;

  constructor(public readonly registration: UserRegistrationDetails, public readonly token: string, public readonly store: string) {}
}

export class RegisterSuccess implements Action {
  readonly type = AuthActionType.RegisterSuccess;

  constructor() {}
}

export class RegisterFailed implements Action {
  readonly type = AuthActionType.RegisterFailed;

  constructor(public readonly errors: string[]) {}
}

export class RegisterByInvitation implements Action {
  readonly type = AuthActionType.RegisterByInvitation;

  constructor(public readonly registration: UserRegistrationDetails, public readonly token: string, public readonly store: string) {}
}

export class RegisterByInvitationSuccess implements Action {
  readonly type = AuthActionType.RegisterByInvitationSuccess;

  constructor(public readonly loginResponse: LoginResponse) {}
}

export class RegisterByInvitationFailed implements Action {
  readonly type = AuthActionType.RegisterByInvitationFailed;

  constructor(public readonly errors: string[]) {}
}

export class VerifyAccount implements Action {
  readonly type = AuthActionType.VerifyAccount;

  constructor(public readonly email: string) {}
}

export class VerifyAccountSuccess implements Action {
  readonly type = AuthActionType.VerifyAccountSuccess;

  constructor() {}
}

export class VerifyAccountFailed implements Action {
  readonly type = AuthActionType.VerifyAccountFailed;

  constructor() {}
}

export class ResetPassword implements Action {
  readonly type = AuthActionType.ResetPassword;

  constructor(public readonly email: string) {}
}

export class ResetPasswordSuccess implements Action {
  readonly type = AuthActionType.ResetPasswordSuccess;

  constructor() {}
}

export class ResetPasswordInitial implements Action {
  readonly type = AuthActionType.ResetPasswordInitial;

  constructor() {}
}

export class ResetPasswordFailed implements Action {
  readonly type = AuthActionType.ResetPasswordFailed;

  constructor(public readonly errorMessage: string) {}
}

export class UserForToken implements Action {
  readonly type = AuthActionType.UserForToken;

  constructor(public readonly username: string, public readonly token: string) {}
}

export class UpdatePassword implements Action {
  readonly type = AuthActionType.UpdatePassword;

  constructor(public readonly password: string) {}
}

export class UpdatePasswordSuccess implements Action {
  readonly type = AuthActionType.UpdatePasswordSuccess;

  constructor() {}
}

export class UpdatePasswordFailed implements Action {
  readonly type = AuthActionType.UpdatePasswordFailed;

  constructor(public readonly errorMessage: string) {}
}

export class FetchLoggedInUser implements Action {
  readonly type = AuthActionType.FetchLoggedInUser;

  constructor() {}
}

export class FetchLoggedInUserSuccess implements Action {
  readonly type = AuthActionType.FetchLoggedInUserSuccess;

  constructor(public readonly loggedInUser: LoggedInUser) {}
}

export class FetchLoggedInUserFailed implements Action {
  readonly type = AuthActionType.FetchLoggedInUserFailed;

  constructor(public readonly errorMessage: string) {}
}

export class GetLocationInfo implements Action {
  readonly type = AuthActionType.GetLocationInfo;

  constructor() {}
}

export class GetLocationInfoSuccess implements Action {
  readonly type = AuthActionType.GetLocationInfoSuccess;

  constructor(public readonly locationInfo: LocationInfo) {}
}

export class GetLocationInfoFailed implements Action {
  readonly type = AuthActionType.GetLocationInfoFailed;

  constructor(public readonly errorMessage: string) {}
}

export class RegisterPartner implements Action {
  readonly type = AuthActionType.RegisterPartner;

  constructor(public readonly registration: UserRegistrationDetails) {}
}

export class RegisterPartnerSuccess implements Action {
  readonly type = AuthActionType.RegisterPartnerSuccess;

  constructor() {}
}

export class RegisterPartnerFailed implements Action {
  readonly type = AuthActionType.RegisterPartnerFailed;

  constructor(public readonly errors: string[]) {}
}

export type AuthAction =
  InitializeLoginState
  | Login
  | SocialLogin
  | PartnerSocialLogin
  | InvitationSocialLogin
  | LoginSuccess
  | RefreshTokenSuccess
  | LoginFailed
  | SocialLoginFailed
  | InitializePasswordAuthState
  | PasswordAuth
  | PasswordAuthSuccess
  | PasswordAuthFailed
  | Logout
  | LogoutSuccess
  | LogoutFailed
  | InitializeRegistrationState
  | Register
  | RegisterLoginDetails
  | RegisterPartnerLoginDetails
  | RegisterByInvitationLoginDetails
  | RegisterSuccess
  | RegisterFailed
  | RegisterByInvitation
  | RegisterByInvitationSuccess
  | RegisterByInvitationFailed
  | VerifyAccount
  | VerifyAccountSuccess
  | VerifyAccountFailed
  | ResetPassword
  | ResetPasswordSuccess
  | ResetPasswordFailed
  | ResetPasswordInitial
  | UserForToken
  | UpdatePassword
  | UpdatePasswordSuccess
  | UpdatePasswordFailed
  | FetchLoggedInUser
  | FetchLoggedInUserSuccess
  | FetchLoggedInUserFailed
  | RegisterPartner
  | RegisterPartnerSuccess
  | RegisterPartnerFailed
  | GetLocationInfo
  | GetLocationInfoSuccess
  | GetLocationInfoFailed
;
