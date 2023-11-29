import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiLogPublisher } from './ApiLogPublisher';
import { ConsoleLogPublisher } from './ConsoleLogPublisher';
import { LogPublisher } from './LogPublisher';

@Injectable({
    providedIn: 'root'
})
export class LogPublishersService {

    private http: HttpClient;

    constructor(handler: HttpBackend) {
        this.http = new HttpClient(handler);
        this.buildPublishers();
    }

    publishers: LogPublisher[] = [];

    buildPublishers(): void {
       if (environment.name !== 'local') {
            this.publishers.push(new ApiLogPublisher(this.http));
       }
       this.publishers.push(new ConsoleLogPublisher());
    }
}
