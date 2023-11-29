import { ApplicationRef, Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Store } from '@ngrx/store';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';
import { NewServiceWorkerVersion } from './application-state/+state/application-state.actions';

declare let gtag: (...params: any[]) => void;
export let browserRefresh = false;
@Component({
  // tslint:disable-next-line
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'GonnaOrder';

  constructor(private router: Router, private swUpdate: SwUpdate, private appRef: ApplicationRef, private store: Store<any>) {
    if (typeof gtag !== 'undefined') {
      this.router.events.subscribe((y: NavigationEnd) => {
        if (y instanceof NavigationEnd) {
          gtag('config', 'UA-161479475-1', { page_path: y.url });
        }
      });
    }
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        browserRefresh = !router.navigated;
      }
    });
  }

  ngOnInit() {
    console.log('checking for app version');
    if (this.swUpdate.isEnabled) {
      console.log('service worker enabled');

      const every30Seconds$ = interval(30 * 1000);
      const appIsStable$ = this.appRef.isStable.pipe(
        first(isStable => isStable === true)
      );

      concat(appIsStable$, every30Seconds$)
        .subscribe(() => {
          console.log('checking for updates');
          this.swUpdate.checkForUpdate();
        });

      this.swUpdate.available.subscribe(event => {
        console.log('current version is', event.current);
        console.log('available version is', event.available);
        this.store.dispatch(new NewServiceWorkerVersion(event.current.hash, event.available.hash));
      });
      this.swUpdate.activated.subscribe(event => {
        console.log('old version was', event.previous);
        console.log('new version is', event.current);
      });
    }

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0);
    });
  }
}
