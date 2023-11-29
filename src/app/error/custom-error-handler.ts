import { ErrorHandler, Injector, Injectable } from '@angular/core';
import { ErrorMessage } from '../public/store/+state/stores.actions';
import { WindowRefService } from '../window.service';
import { GlobalErrorService } from './global-error.service';
import { LogService } from '../shared/logging/LogService';
import * as Sentry from '@sentry/angular';
import { environment } from 'src/environments/environment';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {

    constructor(private injector: Injector) { }

    handleError(error) {

        // Force reloading the app in case an obsolete chunk is requested
        const chunkFailedMessage = /Loading chunk [\d]+ failed/;

        if (chunkFailedMessage.test(error.message)) {
            window.location.reload();
            return;
        }

        const geoCodeNoResultMessage = /MapsRequestError: GEOCODER_GEOCODE: ZERO_RESULTS:/;
        if (geoCodeNoResultMessage.test(error.message)) {
            return;
        }

        const errorService = this.injector.get(GlobalErrorService);
        const windowRefSer = this.injector.get(WindowRefService);
        const logService = this.injector.get(LogService);

        logService.error('error', error.stack || error);

        if (environment.name !== 'local') {
            Sentry.captureException(error.originalError || error);
        }

        if (windowRefSer.nativeWindowLocation.hostname.startsWith('admin')) {
            // Admin side
            errorService.currentAngularError = error.stack || error;
            // For all unhandled errors in admin side go to error page
            errorService.navigateToErrorPage(['/manager/expectederror']);
        } else {
            // Public side
            errorService.dispatchErrorAction(new ErrorMessage('public.global.errorUnexpected'));
        }

    }

}
