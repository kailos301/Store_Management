import { ClientStoreLocationRequest } from './../store-location';
import { Component, OnInit, Input, Output, SimpleChanges, OnChanges, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';
import { ClientStore } from 'src/app/stores/stores';
import { WindowRefService } from 'src/app/window.service';
import { helpPage } from 'src/app/shared/help-page.const';
import moment from 'moment';
import { getSelectedStoreLocation } from '../+state/store-location.selectors';

@Component({
  selector: 'app-store-location-form',
  templateUrl: './store-location-form.component.html',
  styleUrls: ['./store-location-form.component.scss']
})
export class StoreLocationFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() location: ClientStoreLocationRequest;
  @Input() mode: 'CREATE' | 'UPDATE';
  @Output() save = new EventEmitter<ClientStoreLocationRequest>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  locationForm: FormGroup;
  locationUrl = '';
  currentLocation = '';
  storeAlias = '';
  storeOpenTap: boolean;
  store$: Observable<ClientStore>;
  private protocol: string;
  private host: string;
  private destroy$ = new Subject<void>();
  isStoreOperator = false;
  storeId: number;
  qrCodesLocationHelpPage = helpPage.locations;
  storeId$: Observable<number>;
  locationId: any;
  locationLabel: any;

  constructor(private fb: FormBuilder, private store: Store<any>, private windowService: WindowRefService) {
    this.protocol = windowService.nativeWindowLocation.protocol;
    this.host = windowService.nativeWindowLocation.host.replace('admin.', '');
  }


  ngOnInit() {
    this.locationForm = this.fb.group({
      label: [this.location.label, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')])],
      description: [this.location.description],
      comment: [this.location.comment],
      locationType: [this.location.locationType],
      openTap: [this.location.openTap],
      status: [this.location.status === 'OPEN']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      this.storeId = s.id;
      this.storeAlias = s.aliasName;
      if (s && s.settings && s.settings.OPEN_TAP) {
        this.storeOpenTap = s.settings.OPEN_TAP;
      }
    });

    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s && s.storeRoles && this.storeId && s.storeRoles[+this.storeId] && s.storeRoles[+this.storeId] === 'STORE_STANDARD') {
        this.isStoreOperator = true;
      } else {
        this.isStoreOperator = false;
      }
    });

    this.store.pipe(
      select(getSelectedStoreLocation),
      takeUntil(this.destroy$)
    ).subscribe(l => {
      this.locationId = l.id;
      this.locationLabel = l.label;
    });

    this.locationUrl = this.protocol + '//' + this.storeAlias + '.' + this.host + '/#l/' + this.location.label;
  }

  getControl(name: string) {
    return this.locationForm.get(name);
  }

  setLocationURL(newLocation: any) {
    if (!this.locationForm.invalid) {
      this.locationUrl = this.protocol + '//' + this.storeAlias + '.' + this.host + '/#l/' + newLocation;
    } else {
      this.locationUrl = this.protocol + '//' + this.storeAlias + '.' + this.host + '/#l/';
    }
  }

  onLocationTypeChanged(event) {
    this.locationForm.value.locationType = event.target.value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const newLocation = changes.location;
    if (this.locationForm && !!newLocation) {
      this.currentLocation = newLocation.currentValue.label;
      this.locationUrl = this.protocol + '//' + this.storeAlias + '.' + this.host + '/#l/' + this.currentLocation;
      this.locationForm.patchValue(
        newLocation.currentValue
      );
    }
  }

  onSubmit() {
    if (!this.locationForm.valid) {
      return;
    }
    this.locationForm.value.label = this.locationForm.value.label.trim();
    this.locationForm.value.description = (this.locationForm.value.description) ? this.locationForm.value.description.trim() : '';
    this.locationForm.value.comment = (this.locationForm.value.comment) ? this.locationForm.value.comment.trim() : '';
    this.locationForm.value.locationType = (this.locationForm.value.locationType) ? this.locationForm.value.locationType.trim() : null;
    this.save.emit(this.locationForm.value);
  }

  onCancel() {
    this.cancel.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  copyLocationURL() {
    const el = document.createElement('textarea');
    el.value = this.locationUrl.toString();
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  getOpenTime(openDate) {
    const currentDate: any = new Date();
    const tableOpenDate: any = new Date(openDate);
    return moment.utc(moment(currentDate, 'DD/MM/YYYY HH:mm:ss').diff(moment(tableOpenDate, 'DD/MM/YYYY HH:mm:ss'))).format('HH:mm');
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
