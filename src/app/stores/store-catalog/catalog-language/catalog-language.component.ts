import { Component, OnInit } from '@angular/core';
import { ClientStore } from '../../stores';
import { getSelectedStore } from '../../+state/stores.selectors';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../../+state/stores.reducer';

@Component({
  selector: 'app-catalog-language',
  templateUrl: './catalog-language.component.html',
  styleUrls: ['./catalog-language.component.scss']
})
export class CatalogLanguageComponent implements OnInit {

  store$: Observable<ClientStore>;
  storeDefaultLangId: number;

  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    this.store$ = this.store.pipe(select(getSelectedStore));
  }

}
