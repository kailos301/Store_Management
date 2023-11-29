import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { Observable, of, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(private swPush: SwPush) { }

  isSupported(): boolean {
    try {
      return ('PushManager' in window || 'pushManager' in ServiceWorkerRegistration.prototype)
              && this.swPush.isEnabled
              && Notification.permission !== 'denied';
    } catch (e) {
      return false;
    }
  }

  isPermitted(): boolean {
    try {
      return ('PushManager' in window || 'pushManager' in ServiceWorkerRegistration.prototype)
              && this.swPush.isEnabled
              && Notification.permission === 'granted';
    } catch (e) {
      return false;
    }
  }

  currentSubscription(): Observable<PushSubscription> {
    return this.swPush.subscription;
  }

  requestPermission(): Observable<PushSubscription> {
    return from(this.swPush.requestSubscription({
      serverPublicKey: environment.VAPID_PUBLIC_KEY
    }));
  }

}
