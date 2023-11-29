import { ClientStore } from './../stores';
import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { Paging } from 'src/app/api/types/Pageable';
import { CreateStoreLocation, OpenStoreLocationCreationForm, CloseStoreLocationCreationForm, LoadStoreLocationsPage,
  LoadStoreLocations } from './+state/store-location.actions';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ClientStoreLocationRequest } from './store-location';
import { getStoreLocationsList, getCreationFormVisible } from './+state/store-location.selectors';
import { map, filter, take, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { helpPage } from 'src/app/shared/help-page.const';
import { DownloadQRFullPdf, DownloadQRImages } from '../+state/stores.actions';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreLocationService } from './store-location.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

@Component({
  selector: 'app-store-location',
  templateUrl: './store-location.component.html',
  styleUrls: ['./store-location.component.scss']
})
export class StoreLocationComponent implements OnInit, OnDestroy {
  bulkCreationForm: FormGroup;
  store$: Observable<ClientStore>;
  storeId$: Observable<number>;
  locations$: Observable<any>;
  location: any = [];
  storeId: number;
  formVisible$: Observable<boolean>;
  qrCodeHelpPage = helpPage.locations;
  storeAlias: string;
  totalLocations: number;
  isStoreOperator = false;
  private ngUnsubscribe = new Subject();
  storeOpenTap: boolean;

  newLocation: ClientStoreLocationRequest = { label: '' };
  @ViewChild('createLocation') createLocation: TemplateRef<any>;
  @ViewChild('createBulkLocation') createBulkLocation: TemplateRef<any>;
  @ViewChild('openLocationPIN') openLocationPIN: TemplateRef<any>;

  constructor(private fb: FormBuilder,
              private store: Store<any>,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              private router: Router,
              private service: StoreLocationService,
              private toastr: ToastrService,
              private translateSer: TranslateService) { }

  ngOnInit() {
    const params = this.route.params as any;
    this.storeId = params._value.id;
    this.bulkCreationForm = this.fb.group({
      numberOfStores: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(200), Validators.pattern(/^\d+$/)])],
      comment: ['']
    });
    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(s => {
      if (s && s.storeRoles && this.storeId && s.storeRoles[this.storeId] && s.storeRoles[this.storeId] === 'STORE_STANDARD') {
        this.isStoreOperator = true;
      }
    });
    this.formVisible$ = this.store.pipe(
      select(getCreationFormVisible)
    );
    this.store$ = this.store.pipe(
      select(getSelectedStore)
    );

    this.storeId$ = this.store$.pipe(
      filter(s => s.id > 0),
      map(s => s.id)
    );

    this.locations$ = this.store.pipe(select(getStoreLocationsList), tap(data => this.totalLocations = data.data.length ?? 0));
    this.store$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((selectedStore) => {
      this.storeAlias = selectedStore.aliasName;
      if (selectedStore && selectedStore.settings && selectedStore.settings.OPEN_TAP) {
        this.storeOpenTap = selectedStore.settings.OPEN_TAP;
      }
    });
  }

  paginate(paging: Paging) {
    this.store.dispatch(new LoadStoreLocationsPage(paging));
  }

  toggleLocationForm(display: boolean) {
    if (display) {
      this.store.dispatch(new OpenStoreLocationCreationForm());
    } else {
      this.store.dispatch(new CloseStoreLocationCreationForm());
      this.resetForm(this.bulkCreationForm);
    }
    this.dialog.closeAll();
  }

  getBulkControl(name: string) {
    return this.bulkCreationForm.get(name);
  }

  doNotAllowExponential(event) {
    return event.keyCode !== 69;
  }

  create(location: ClientStoreLocationRequest) {
    this.store.dispatch(new CreateStoreLocation([location]));
    this.dialog.closeAll();
  }

  onBulkCreate() {
    const payload: ClientStoreLocationRequest[] = [];
    for (let i = 0; i < parseInt(this.bulkCreationForm.value.numberOfStores, 10); i++) {
      payload.push({ label: (i + 1).toString(10), comment: this.bulkCreationForm.value.comment });
    }

    this.store.dispatch(new CreateStoreLocation(payload));
    this.dialog.closeAll();
  }

  onCancel() {
    this.dialog.closeAll();
  }

  resetForm(form: FormGroup) {
    form.reset();
  }

  openCreateLocationDialog(): void {
    this.router.navigate([`/manager/stores/${this.storeId}/locations/CREATE_LOCATION/manage`]);
  }

  onSubmit(event, locationId) {
    const action = event.target.checked ? 'open' : 'close';
    this.service.patch(this.storeId, locationId, action).subscribe(
      (data: any) => {
        this.location = data;
        this.store.dispatch(new LoadStoreLocations(this.storeId, { page: 0, size: 24 }));
        this.toastr.success(this.translateSer.instant('admin.store.location.status.success'));
        if (action === 'open') {
          const dialogRef = this.dialog.open(this.openLocationPIN, {
            width: '20%'
          });
        }
      },
      (error: any) => {
        this.toastr.error(this.translateSer.instant('admin.store.location.status.error'));
      }
    );
  }

  getOpenTime(openDate) {
    const currentDate: any = new Date();
    const tableOpenDate: any = new Date(openDate);
    return moment.utc(moment(currentDate, 'DD/MM/YYYY HH:mm:ss').diff(moment(tableOpenDate, 'DD/MM/YYYY HH:mm:ss'))).format('HH:mm');
  }

  openBulkCreateLocationDialog(): void {
    const dialogRef = this.dialog.open(this.createBulkLocation, {
      width: '50%'
    });
  }

  downloadImages() {
    this.storeId$.pipe(
      filter(s => s > 0),
      take(1),
    ).subscribe(s => { this.store.dispatch(new DownloadQRImages(s)); });
  }

  downloadFullPdf() {
    this.storeId$.pipe(
      filter(s => s > 0),
      take(1),
    ).subscribe(s => { this.store.dispatch(new DownloadQRFullPdf(s)); });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
