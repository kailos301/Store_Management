import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { map, filter } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { getLoggedInUser } from '../auth/+state/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class NavigationGuard implements CanActivate {

  constructor(private store: Store<any>, private router: Router) { }

  canActivate() {
    return this.store.pipe(
      select(getLoggedInUser),
      filter(l => l.id > 0),
      map(l => {
        if (l.superAdmin) {
          this.router.navigate(['/manager/stores/list']);
        } else if (l.numberOfStores > 0) {
          this.router.navigate(['/manager/stores']);
        } else if (l.affiliate) {
          this.router.navigate(['/manager/user/partner']);
        } else {
          this.router.navigate(['/manager/stores/init']);
        }
        return true;
      })
    );
  }
}
