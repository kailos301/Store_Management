import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { isLoaderActive } from './+state/loader.selectors';
import { Loader } from './+state/loader.reducer';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  isLoading: Observable<any>;
  constructor(private store: Store<Loader>) { }

  ngOnInit() {
    this.isLoading = this.store.pipe(
      select(isLoaderActive)
    );
  }

}
