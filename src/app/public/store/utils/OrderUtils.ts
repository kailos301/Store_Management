import { ClientStore, LocationValid, OrderMeta } from 'src/app/stores/stores';
import { PICKUP_METHOD } from '../store-checkout/checkout.service';
import { OrderUpdateRequest } from '../types/OrderUpdateRequest';

export default class OrderUtils {
    // disable location validation as discussed via Slack...
    static mapOrderMetadataToOrderUpdateRequest(
        orderMetadata: OrderMeta,
        selectedStore: ClientStore,
        validLocations: LocationValid,
        selectedLang: string
    ): OrderUpdateRequest {
        const obj: OrderUpdateRequest = {
            catalogLanguageLocale: 'en',
            uiLanguageLocale: 'en',
            deliveryMethod: 'NO_LOCATION'
        };
        if (selectedStore && selectedStore.language && selectedStore.language.locale) {
            obj.uiLanguageLocale = selectedStore.language.locale;
        }
        if (selectedLang) {
            obj.catalogLanguageLocale = selectedLang;
        }
        // prepare meta data
        const comment = this.getOrderMetaData(orderMetadata, 'comment');
        if (comment || comment === '') {
            obj.comment = comment;
        }
        if (this.getOrderMetaData(orderMetadata, 'customerName')) {
            obj.customerName = this.getOrderMetaData(orderMetadata, 'customerName');
        }
        if (this.getOrderMetaData(orderMetadata, 'wishTime')) {
            obj.wishTime = this.getOrderMetaData(orderMetadata, 'wishTime');
        }
        if (this.getPickupMethodAsInt(orderMetadata) >= 0) {
            if (this.getOrderMetaData(orderMetadata, 'customerUserId') !== undefined) {
                obj.customerUserId = this.getOrderMetaData(orderMetadata, 'customerUserId');
            }
            if (this.getOrderMetaData(orderMetadata, 'customerEmail')) {
                obj.customerEmail = this.getOrderMetaData(orderMetadata, 'customerEmail');
            }
            if (this.getOrderMetaData(orderMetadata, 'customerPhoneNumber')) {
                obj.customerPhoneNumber = this.getOrderMetaData(orderMetadata, 'customerPhoneNumber');
            }
        }
        if (this.getPickupMethodAsInt(orderMetadata) === PICKUP_METHOD.AT_ADDRESS
            && selectedStore.settings.FLOOR_NUMBER_VISIBILITY) {
            if (this.getOrderMetaData(orderMetadata, 'customerFloor')) {
                obj.floorNumber = this.getOrderMetaData(orderMetadata, 'customerFloor');
            }
        }

        if (this.getPickupMethodAsInt(orderMetadata) === 0) {
            obj.deliveryMethod = 'IN_STORE_LOCATION';
            if (validLocations) {
                obj.location = validLocations.id;
                // clear current meta data and update it with location info
                // don't clear the order meta yet, do this after the order is submitted
            } else {
                // disable location validation as discussed via Slack...
                // somehow the location was manipulated after it was validated
                // return { errorMessage: 'public.global.errorExpected', errorCode: '300' };
            }
        }
        if (this.getPickupMethodAsInt(orderMetadata) === 2) {
            if (this.getOrderMetaData(orderMetadata, 'customerStreet')) {
                obj.deliveryStreetAddress = this.getOrderMetaData(orderMetadata, 'customerStreet');
            }
            if (this.getOrderMetaData(orderMetadata, 'customerZip')) {
                obj.deliveryPostCode = this.getOrderMetaData(orderMetadata, 'customerZip');
            }
            if (this.getOrderMetaData(orderMetadata, 'customerTown')) {
                obj.deliveryCity = this.getOrderMetaData(orderMetadata, 'customerTown');
            }
            obj.deliveryMethod = 'ADDRESS';
        }
        if (this.getOrderMetaData(orderMetadata, 'voucherCode')) {
            obj.voucherCode = this.getOrderMetaData(orderMetadata, 'voucherCode');
        }

        if (this.getOrderMetaData(orderMetadata, 'latitude')) {
            obj.latitude = this.getOrderMetaData(orderMetadata, 'latitude');
        }

        if (this.getOrderMetaData(orderMetadata, 'longitude')) {
            obj.longitude = this.getOrderMetaData(orderMetadata, 'longitude');
        }
        return obj;
    }

    private static getOrderMetaData(orderMetadata: OrderMeta, key: string) {
        if (orderMetadata[key]) {
            return orderMetadata[key];
        }
        return '';
    }

    private static getPickupMethodAsInt(orderMetadata: OrderMeta) {
        return parseInt(orderMetadata.deliveryMethod, 10);
    }
}
