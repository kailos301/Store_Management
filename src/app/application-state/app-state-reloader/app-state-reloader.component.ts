import { Component, Input, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-state-reloader',
  templateUrl: './app-state-reloader.component.html',
  styleUrls: ['./app-state-reloader.component.scss']
})
export class AppStateReloaderComponent implements OnInit {

  @Input() buttonText: string;
  @Input() isAdmin = false;


  constructor(private updates: SwUpdate, private store: Store<any>) { }

  ngOnInit() {
  }

  onClick(evt) {
    evt.preventDefault();
    if (this.updates.isEnabled) {
      this.updates.activateUpdate().then(() => document.location.reload());
    } else {
      document.location.reload();
    }
  }

}
