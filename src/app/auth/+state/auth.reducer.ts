import { Language } from './../../api/types/Language';
import { UserActionType, UserAction } from './../../user/+state/user.actions';
import { StoresActionType, StoresAction } from './../../stores/+state/stores.actions';
import { AuthAction, AuthActionType } from './auth.actions';
import { combineReducers } from '@ngrx/store';
import { Tokens, LoggedInUser, LocationInfo } from '../auth';

export type RegistrationStatus = 'INITIAL' | 'REGISTERED' | 'FAILED';
export type AccountVerificationStatus = 'INITIAL' | 'VERIFICATION_SENT' | 'FAILED';
export type ResetPasswordStatus = 'INITIAL' | 'RESET_PASSWORD_SENT' | 'FAILED';
export type UpdatePasswordStatus = 'INITIAL' | 'PASSWORD_UPDATED' | 'FAILED';

export interface LoginState {
  userId: number;
  username: string;
  invalidCredentials: boolean;
  socialAccountLoginFailed: boolean;
}

export interface RegisterState {
  status: RegistrationStatus;
  errorMessage: string;
}

export interface PasswordResetState {
  status: ResetPasswordStatus;
  errorMessage: string;
}

export interface PasswordUpdateState {
  status: UpdatePasswordStatus;
  errorMessage: string;
  username: string;
  token: string;
}

export interface LocationInfoState {
  data: LocationInfo;
  errorMessage: string;
}

export interface Auth {
  login: LoginState;
  loggedInUser: LoggedInUser;
  tokens: Tokens;
  register: RegisterState;
  registerByInvitation: RegisterState;
  accountVerification: AccountVerificationStatus;
  passwordReset: PasswordResetState;
  passwordUpdate: PasswordUpdateState;
  locationInfo: LocationInfoState;
}

export interface AuthState {
  auth: Auth;
}

export const authInitialState: Auth = {
  login: {
    userId: -1,
    username: '',
    invalidCredentials: false,
    socialAccountLoginFailed: false,
  },
  loggedInUser: {
    id: -1,
    username: '',
    authenticationMethod: 'PASSWORD',
    superAdmin: false,
    affiliate: false,
    preferredLanguage: {
      id: -1,
      name: '',
      locale: '',
      covered_admin_ui: false
    },
    numberOfStores: 0,
    storeRoles: []
  },
  tokens: {
    jwt: null,
    refreshToken: null
  },
  register: {
    status: 'INITIAL',
    errorMessage: ''
  },
  registerByInvitation: {
    status: 'INITIAL',
    errorMessage: ''
  },
  accountVerification: 'INITIAL',
  passwordReset: {
    status: 'INITIAL',
    errorMessage: ''
  },
  passwordUpdate: {
    status: 'INITIAL',
    errorMessage: '',
    username: '',
    token: ''
  },
  locationInfo: {
    data: {
      cityName: '',
      countryCode: '',
      countryName: '',
      ipAddress: '',
      ipVersion: 0,
      regionName: '',
      timeZone: '',
      zipCode: ''
    },
    errorMessage: ''
  }
};

export function login(authState = authInitialState.login, action: AuthAction): LoginState {
  switch (action.type) {
    case AuthActionType.LoginSuccess:
    case AuthActionType.PasswordAuthSuccess:
      return {
        userId: action.response.userId,
        username: action.response.username,
        invalidCredentials: false,
        socialAccountLoginFailed: false
      };
    case AuthActionType.LoginFailed:
    case AuthActionType.PasswordAuthFailed:
      return { ...authInitialState.login, invalidCredentials: true };
    case AuthActionType.SocialLoginFailed:
      return { ...authInitialState.login, socialAccountLoginFailed: true };
    case AuthActionType.LogoutSuccess:
      return { ...authInitialState.login };
    case AuthActionType.InitializeRegistrationState:
      return {
        invalidCredentials: false,
        socialAccountLoginFailed: false,
        userId: -1,
        username: ''
      };
    case AuthActionType.ResetPasswordInitial:
      return {
        invalidCredentials: false,
        socialAccountLoginFailed: false,
        userId: -1,
        username: ''
      };
    default:
      return authState;
  }
}

export function loggedInUser(userState = authInitialState.loggedInUser, action: AuthAction | StoresAction | UserAction): LoggedInUser {

  switch (action.type) {
    case AuthActionType.FetchLoggedInUserSuccess:
      return { ...action.loggedInUser };
    case AuthActionType.FetchLoggedInUserFailed:
      return { ...authInitialState.loggedInUser };
    case AuthActionType.LogoutSuccess:
      return { ...authInitialState.loggedInUser };
    case StoresActionType.CreateStoreSuccess:
      const newState = {...userState};
      newState.storeRoles[action.id] = 'STORE_ADMIN';
      newState.numberOfStores = userState.numberOfStores + 1;
      return newState;
    case UserActionType.AddUserAffiliateSuccess:
        return { ...userState,  affiliate: true};
    default:
      return userState;
  }

}

export function tokens(tokensState = authInitialState.tokens, action: AuthAction): Tokens {
  switch (action.type) {
    case AuthActionType.LoginSuccess:
      return { ...action.response.tokens };
    case AuthActionType.RefreshTokenSuccess:
      return { ...action.tokens};
    case AuthActionType.LogoutSuccess:
      return { ...authInitialState.tokens };
    default:
      return tokensState;
  }
}

// export function passwordAuth(authState = authInitialState['login'], action: AuthAction): LoginState {
//   switch (action.type) {
//     case AuthActionType.LoginSuccess:
//       return {
//         userId: action.response.userId,
//         username: action.response.username,
//         invalidCredentials: false,
//         tokens: action.response.tokens
//       };
//     case AuthActionType.RefreshTokenSuccess:
//       return {...authState, tokens: action.tokens};
//     case AuthActionType.LoginFailed:
//       return { ...authInitialState['login'], invalidCredentials: true };
//     case AuthActionType.LogoutSuccess:
//       return { ...authInitialState['login'] };
//     default:
//       return authState;
//   }
// }

export function registerByInvitation(state = authInitialState.registerByInvitation, action: AuthAction): RegisterState {
  switch (action.type) {
      case AuthActionType.RegisterSuccess:
        return { errorMessage: '', status: 'REGISTERED'};
      case AuthActionType.RegisterFailed:
        return { errorMessage: action.errors.join('\n'), status: 'FAILED'};
      default:
        return state;
  }
}

export function register(state = authInitialState.register, action: AuthAction): RegisterState {
  switch (action.type) {
      case AuthActionType.InitializeRegistrationState:
        return authInitialState.register;
      case AuthActionType.RegisterSuccess:
      case AuthActionType.RegisterPartnerSuccess:
        return { errorMessage: '', status: 'REGISTERED'};
      case AuthActionType.RegisterFailed:
      case AuthActionType.RegisterPartnerFailed:
        return { errorMessage: action.errors.join('\n'), status: 'FAILED'};
      default:
        return state;
  }
}

export function accountVerification(state = authInitialState.accountVerification, action: AuthAction): AccountVerificationStatus {
  switch (action.type) {
      // case AuthActionType.InitializeRegistrationState:
      //   return authInitialState['register'];
      case AuthActionType.VerifyAccountSuccess:
        return  'VERIFICATION_SENT';
      case AuthActionType.VerifyAccountFailed:
        return 'FAILED';
      default:
        return state;
  }
}

export function passwordReset(state = authInitialState.passwordReset, action: AuthAction): PasswordResetState {
  switch (action.type) {
      case AuthActionType.ResetPasswordInitial:
        return { status: 'INITIAL', errorMessage: '' };
      case AuthActionType.ResetPasswordSuccess:
        return  { status: 'RESET_PASSWORD_SENT' , errorMessage: '' };
      case AuthActionType.ResetPasswordFailed:
        return { status: 'FAILED', errorMessage: action.errorMessage };
      default:
        return state;
  }
}

export function passwordUpdate(state = authInitialState.passwordUpdate, action: AuthAction): PasswordUpdateState {
  switch (action.type) {
      case AuthActionType.UserForToken:
        return  { status: 'INITIAL' , errorMessage: '', username: action.username, token: action.token };
      case AuthActionType.UpdatePasswordFailed:
        return { status: 'FAILED', errorMessage: action.errorMessage, username: '', token: '' };
      default:
        return state;
  }
}

export function locationInfo(state = authInitialState.locationInfo, action: AuthAction): LocationInfoState {
  switch (action.type) {
      case AuthActionType.GetLocationInfoSuccess:
        return { data: action.locationInfo, errorMessage: '' };
      case AuthActionType.GetLocationInfoFailed:
        return { ...state, errorMessage: '' };
      default:
        return state;
  }
}

const reducer: (state: Auth, action: AuthAction) => Auth = combineReducers({
  login,
  loggedInUser,
  tokens,
  register,
  registerByInvitation,
  accountVerification,
  passwordReset,
  passwordUpdate,
  locationInfo
});

export function authReducer(state: Auth = authInitialState, action: AuthAction): Auth {
  return reducer(state, action);
}
