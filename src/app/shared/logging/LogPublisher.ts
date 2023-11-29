import { Observable } from 'rxjs';
import { LogEntry } from './LogEntry';

export abstract class LogPublisher {
    abstract log(record: LogEntry): Observable<boolean>;
    abstract clear(): Observable<boolean>;
}
