import { Component, OnInit } from '@angular/core';
import { StoreZone } from '../stores';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { getStoreZone } from '../+state/stores.selectors';

@Component({
  selector: 'app-store-zone-view',
  templateUrl: './store-zone-view.component.html',
  styleUrls: ['./store-zone-view.component.scss']
})
export class StoreZoneViewComponent implements OnInit {

  zone$: Observable<StoreZone>;

  constructor(private store: Store<any>) { }

  ngOnInit() {
    this.zone$ = this.store.pipe(
      select(getStoreZone)
    );

  }
}
