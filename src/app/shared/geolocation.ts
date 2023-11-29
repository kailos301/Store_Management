export class GeoLocation {
     private static getLocationInfo() {
        const request = new XMLHttpRequest();
        request.open('GET', 'https://freeipapi.com/', false);
        request.send();
        if (request.status !== 200) {
            return null;
        } else {
            const locationStr = request.responseText.replace('callback(', '').replace(')', '');
            if (locationStr) {
                return JSON.parse(locationStr);
            } else {
                return null;
            }
        }
    }

    static getCountryCode() {
        const locationObj = this.getLocationInfo();
        if (locationObj) {
            return locationObj.country_code;
        } else {
            return '';
        }
    }
}


