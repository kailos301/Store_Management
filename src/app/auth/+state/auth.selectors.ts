import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Auth, AuthState } from './auth.reducer';

export const getAuthState = createFeatureSelector<Auth>('auth');
export const getInvalidCredentials = createSelector(getAuthState, (state: Auth) => state.login.invalidCredentials);
export const getSocialAccountLoginFailed = createSelector(getAuthState, (state: Auth) => state.login.socialAccountLoginFailed);
export const getLoggedInUser = createSelector(getAuthState, (state: Auth) => state.loggedInUser);
export const getUserId = createSelector(getAuthState, (state: Auth) => state.loggedInUser.id);
export const getUsername = createSelector(getAuthState, (state: Auth) => state.loggedInUser.username);
export const getIsAffiliate = createSelector(getAuthState, (state: Auth) => state.loggedInUser.affiliate);
export const getRegistrationStatus = createSelector(getAuthState, (state: Auth) => state.register.status);
export const getRegistrationErrorMessage = createSelector(getAuthState, (state: Auth) => state.register.errorMessage);
export const getAccountVerificationStatus = createSelector(getAuthState, (state: Auth) => state.accountVerification);
export const getPasswordReset = createSelector(getAuthState, (state: Auth) => state.passwordReset);
export const getPasswordUpdate = createSelector(getAuthState, (state: Auth) => state.passwordUpdate);
export const getRegistrationByInvitationStatus = createSelector(getAuthState, (state: Auth) => state.registerByInvitation.status);
export const getRegistrationByInvitationErrorMessage
              = createSelector(getAuthState, (state: Auth) => state.registerByInvitation.errorMessage);
export const getTokens = createSelector(getAuthState, (state: Auth) => state.tokens);
export const getLocationInfo = createSelector(getAuthState, (state: Auth) => state.locationInfo);
