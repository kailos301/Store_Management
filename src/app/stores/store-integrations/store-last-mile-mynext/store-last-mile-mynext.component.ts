import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { getSelectedStore } from '../../+state/stores.selectors';

@Component({
  selector: 'app-store-last-mile-mynext',
  templateUrl: './store-last-mile-mynext.component.html',
  styleUrls: ['./store-last-mile-mynext.component.scss']
})
export class StoreLastMileMynextComponent implements OnInit {

  destroyed$ = new Subject<void>();
  invalidCredentials: boolean;

  myNextSettingsForm: FormGroup;
  settings: { [key: string]: any };

  @Input() myNextData = {
    DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID: '',
    DELIVERY_PROVIDER_MYNEXT_API_KEY: '',
    DELIVERY_PROVIDER_MYNEXT_ENABLE: false
  };
  @Output() myNextDetails: EventEmitter<any> = new EventEmitter();

  constructor(private store: Store<any>,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.myNextSettingsForm = this.fb.group({
      DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID: [this.myNextData.DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID],
      DELIVERY_PROVIDER_MYNEXT_API_KEY: [this.myNextData.DELIVERY_PROVIDER_MYNEXT_API_KEY],
      DELIVERY_PROVIDER_MYNEXT_ENABLE: [this.myNextData.DELIVERY_PROVIDER_MYNEXT_ENABLE],
    });
  }

  /**
   * @method disconnectMynext to disconnect mynext
   * @returns void
   */
  disconnectMynext(): void {
    const myNextSettings = this.myNextSettingsForm.getRawValue();
    myNextSettings.DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID = undefined;
    myNextSettings.DELIVERY_PROVIDER_MYNEXT_API_KEY = undefined;
    myNextSettings.DELIVERY_PROVIDER_MYNEXT_ENABLE = false;
    this.myNextDetails.emit(myNextSettings);
  }

  /**
   * @method disconnectMynext to update store settings state
   * @returns void
   */
  updateEnabled(): void {
    const myNextSettings = this.myNextSettingsForm.getRawValue();
    this.myNextDetails.emit(myNextSettings);
  }

}
