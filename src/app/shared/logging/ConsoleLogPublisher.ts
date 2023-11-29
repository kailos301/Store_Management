import { Observable, of } from 'rxjs';
import { LogEntry } from './LogEntry';
import { LogLevel } from './LogLevel';
import { LogPublisher } from './LogPublisher';

export class ConsoleLogPublisher extends LogPublisher {
    log(entry: LogEntry): Observable<boolean> {
        // Log to console
        switch (entry.level) {
            case LogLevel.Debug:
                console.warn(entry.buildLogString());
                break;
            case LogLevel.Error:
                console.error(entry.buildLogString());
                break;
            default:
                console.log(entry.buildLogString());
        }
        return of(true);
    }

    clear(): Observable<boolean> {
        console.clear();
        return of(true);
    }
}
