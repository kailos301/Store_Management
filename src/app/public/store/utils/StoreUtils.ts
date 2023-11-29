import { ClientStore } from 'src/app/stores/stores';
import { PICKUP_METHOD } from '../store-checkout/checkout.service';

export default class StoreUtils {
    static isAsapOrderEnabled(store: ClientStore, deliveryMode: string): boolean {
        // If no order receive option is selected, then do not show the component
        if (deliveryMode === undefined) {
            return false;
        }
        // If delivery at table is selected, then show the component only if selected in admin section
        if (deliveryMode === 'IN_STORE_LOCATION' && store.settings.DELIVERY_IN_STORE_LOCATION_CHOOSE_ASAP_ORDER_DATE) {
            return true;
        }
        // If pickup is selected, then show the component if selected in admin section
        if (deliveryMode === 'NO_LOCATION' && store.settings.DELIVERY_NO_LOCATION_CHOOSE_ASAP_ORDER_DATE) {
            return true;
        }
        // If delivery at address is selected, then show the component if selected in admin section
        if (deliveryMode === 'ADDRESS' && store.settings.DELIVERY_ADDRESS_CHOOSE_ASAP_ORDER_DATE) {
            return true;
        }

        return false;
    }

    static isFutureOrderEnabled(store: ClientStore, deliveryMode: string): boolean {
        // If no order receive option is selected, then do not show the component
        if (deliveryMode === undefined) {
            return false;
        }
        // If delivery at table is selected, then show the component only if selected in admin section
        if (deliveryMode === 'IN_STORE_LOCATION' && store.settings.DELIVERY_IN_STORE_LOCATION_CHOOSE_FUTURE_ORDER_DATE) {
            return true;
        }
        // If pickup is selected, then show the component if selected in admin section
        if (deliveryMode === 'NO_LOCATION' && store.settings.DELIVERY_NO_LOCATION_CHOOSE_FUTURE_ORDER_DATE) {
            return true;
        }
        // If delivery at address is selected, then show the component if selected in admin section
        if (deliveryMode === 'ADDRESS' && store.settings.DELIVERY_ADDRESS_CHOOSE_FUTURE_ORDER_DATE) {
            return true;
        }

        return false;
    }
}
