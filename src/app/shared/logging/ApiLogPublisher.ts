import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LogEntry } from './LogEntry';
import { LogPublisher } from './LogPublisher';

export class ApiLogPublisher extends LogPublisher {
    constructor(private http: HttpClient) {
        super();
    }

    log(entry: LogEntry): Observable<boolean> {
        return this.http.post<{}>(`/api/v1/log`, entry).pipe(
            map(() => true),
            catchError(this.handleErrors)
        );
    }

    clear(): Observable<boolean> {
        return of(true);
    }

    private handleErrors(error: any): Observable<any> {
        const errors: string[] = [];
        let msg = '';

        msg = 'Status: ' + error.status;
        msg += ' - Status Text: ' + error.statusText;
        if (error.error) {
            msg += ' - Exception Message: ' + JSON.stringify(error.error);
        }
        errors.push(msg);

        console.error('An error occurred', errors);
        return of(false);
    }
}
