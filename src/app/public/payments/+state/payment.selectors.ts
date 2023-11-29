import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Paypal, Stripe, Ideal, Bancontact, Viva, DigitalWallets, Paymentsense, RMS, JCC, TrustPayments } from './payment.reducer';

export const getPaypalState = createFeatureSelector<Paypal>('currentPaypalState');
export const getPaypalStore = createSelector(getPaypalState, (state: Paypal) => state.paypalState);
export const getPaypalAccessToken = createSelector(getPaypalState, (state: Paypal) => state.paypalState.accessTokenData);
export const getPaypalOrderData = createSelector(getPaypalState, (state: Paypal) => state.paypalState.paypalOrderData);

export const getStripeStore = createFeatureSelector<Stripe>('currentStripeState');
export const getIdealStore = createFeatureSelector<Ideal>('currentIdealState');
export const getBancontactStore = createFeatureSelector<Bancontact>('currentBancontactState');
export const getVivaStore = createFeatureSelector<Viva>('currentVivaState');
export const getDigitalWalletsStore = createFeatureSelector<DigitalWallets>('currentDigitalWalletsState');
export const getPaymentsenseStore = createFeatureSelector<Paymentsense>('currentPaymentsenseState');
export const getRMSStore = createFeatureSelector<RMS>('currentRMSState');
export const getTrustPaymentsStore = createFeatureSelector<TrustPayments>('currentTrustPaymentsState');
export const getJCCStore = createFeatureSelector<JCC>('currentJCCState');
