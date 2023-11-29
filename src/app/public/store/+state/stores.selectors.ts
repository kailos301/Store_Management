import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
    Catalog,
    Cart,
    View,
    OfferItem,
    OrderMetaData,
    ErrorView,
    OrderStatus,
    ValidateStoreLocation,
    OrderEmail,
    CheckoutData,
    CookieData,
    ZoneData,
    CurrentCatData,
    StoreRules,
    OrderMetaState,
    SocialAuth,
    CustomerDetailsUpdate,
} from './stores.reducer';
import { ClientStore } from 'src/app/stores/stores';

export const getCatalogState = createFeatureSelector<Catalog>('selectedStoreCatalog');
export const getSelectedStore =
    createSelector(
        getCatalogState,
        (state: Catalog) => (state && state.selectedStore) ? state.selectedStore.data : null
    );
export const getSelectedStoreStatus =
    createSelector(
        getCatalogState,
        (state: Catalog) => (state && state.selectedStore) ? state.selectedStore.status : null
    );
export const getSelectedStoreLoadingFrequency =
    createSelector(
        getCatalogState,
        (state: Catalog) => (state && state.selectedStore) ? state.selectedStore.firstLoading : null
    );
export const getSelectedStoreCatalog = createSelector(getCatalogState, (state: Catalog) => state.cataloglist);
export const getSelectedStoreCategories = createSelector(getCatalogState, (state: Catalog) => state.cataloglist.data.categories);
export const getSelectedCategory = createSelector(getCatalogState, (state: Catalog) => state.cataloglist.selectedCategory);
export const getLoadedCatalogLanguage = createSelector(getCatalogState, (state: Catalog) => state.cataloglist.loadedLang);
export const getSelectedStoreOpeningHours = createSelector(getSelectedStore, (store: ClientStore) => {
    if (store && store.specialSchedules) {
        return store.specialSchedules.find(s => s.type === 'OPENING_HOURS');
    }
    return null;
});
export const getSelectedStoreTimeZone = createSelector(getSelectedStore, (store: ClientStore) => {
    if (store) {
        return store.timeZone;
    }
    return null;
});
export const getAvailableCatalogLanguages = createSelector(getCatalogState, (state: Catalog) => state.availableCatalogLanguages);
export const getSelectedLang = createSelector(getCatalogState, (state: Catalog) => state.cataloglist.selectedLang);

export const getOfferItem = createFeatureSelector<OfferItem>('currentOfferItem');
export const getCurrentOfferItem = createSelector(getOfferItem, (state: OfferItem) => state.offerItemState.data);
export const getCurrentOfferItemStatus = createSelector(getOfferItem, (state: OfferItem) => state.offerItemState.status);

export const getCartState = createFeatureSelector<Cart>('currentCartState');
export const getCurrentCartStatus = createSelector(getCartState, (state: Cart) => state.cartState.status);
export const getCurrentCartState = createSelector(getCartState, (state: Cart) => state.cartState.data);
export const getCurrentCartContent = createSelector(getCartState, (state: Cart) => state.cartState.data.orderItems);
export const getCurrentCartUuid = createSelector(getCartState, (state: Cart) => state.cartState.data.uuid);
export const getOrderStatus = createFeatureSelector<OrderStatus>('orderStatus');
export const getCurrentOrderStatus = createSelector(getOrderStatus, (state: OrderStatus) => state.orderStatus);

export const getOrderMetaState = createFeatureSelector<OrderMetaState>('currentOrderMetaState');
export const getCurrentOrderMetaState = createSelector(getOrderMetaState, (state: OrderMetaState) => state);
export const getCurrentOrderDeliveryMethod = createSelector(getOrderMetaState, (state: OrderMetaState) => state.data.deliveryMethod);
export const getCurrentOrderWishTime = createSelector(getOrderMetaState, (state: OrderMetaState) => state.data.wishTime);
export const getStoreOpeningInfo = createSelector(getOrderMetaState, (state: OrderMetaState) => state.storeOpeningInfo);
export const getSlots = createSelector(getOrderMetaState, (state: OrderMetaState) => state.storeOpeningInfo.slots);
export const getStoreOpenInDate = createSelector(getOrderMetaState, (state: OrderMetaState) => state.storeOpeningInfo.openInDate);
export const getOrderWish = createSelector(getOrderMetaState, (state: OrderMetaState) => state.wish);

export const getStoreViewState = createFeatureSelector<View>('currentStoreViewState');
export const getCurrentStoreViewStatus = createSelector(getStoreViewState, (state: View) => state.viewState.status);
export const getUserLanguage = createSelector(getStoreViewState, (state: View) => state.viewState.ulang);

export const getErrorState = createFeatureSelector<ErrorView>('errorState');
export const getCurrentError = createSelector(getErrorState, (state: ErrorView) => state.errorState);

export const getStoreLocations = createFeatureSelector<ValidateStoreLocation>('validateStoreLocation');
export const getStoreLocationsState =
    createSelector(
        getStoreLocations,
        (state: ValidateStoreLocation) => (state && state.storeLocationsState) ? state.storeLocationsState.locationState : null
    );

export const getOrderEmailStatus = createFeatureSelector<OrderEmail>('orderEmailStatus');
export const getOrderEmailBody =
    createSelector(
        getOrderEmailStatus,
        (state: OrderEmail) => (state && state.orderEmail.emailState.body) ? state.orderEmail.emailState.body : null
    );

export const getCheckoutState = createFeatureSelector<CheckoutData>('checkoutState');
export const getCookieState = createFeatureSelector<CookieData>('cookieState');

export const getZoneState = createFeatureSelector<ZoneData>('zoneState');

export const getSelectedCategoryState = createFeatureSelector<CurrentCatData>('currentCatState');

export const getStoreRules = createFeatureSelector<StoreRules>('storeRulesState');

export const getSocialAuth = createFeatureSelector<SocialAuth>('socialLoginState');

export const getCustomerDetailsUpdate = createFeatureSelector<CustomerDetailsUpdate>('customerDetailsUpdateState');

export const getTokens = createSelector(getSocialAuth, (state: SocialAuth) => state.socialLoginState.tokens );
