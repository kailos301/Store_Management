import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { PartialUpdateStore, CreateOrUpdateZone, RemoveZone, UpdateStoreZoneSettings } from '../+state/stores.actions';
import { helpPage } from 'src/app/shared/help-page.const';
import { Router, ActivatedRoute } from '@angular/router';
import { getSelectedStore, getStoreSingleZoneStatus } from '../+state/stores.selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { StoreZone } from '../stores';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { StoresScheduleService } from '../store-schedule/stores-schedule.service';
import { Schedule } from '../store-schedule/stores-schedule';

@Component({
  selector: 'app-store-zone',
  templateUrl: './store-zone.component.html',
  styleUrls: ['./store-zone.component.scss']
})
export class StoreZoneComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() zone: StoreZone;
  @ViewChild('polygon', { static: false }) mapElement: ElementRef;
  zoneForm: FormGroup = this.fb.group({});
  destroyed$ = new Subject<void>();
  storeid = 0; zoneId = 0;
  setupZone: string;
  zoneName: string;
  units: string[] = ['KM', 'MILE'];
  polygons = [];
  updatePolygons = [];
  schedules$: Observable<Schedule[]>;
  settingsHelpPage = helpPage.settingsAddZones;
  zoneStatus: string;
  coordinatesOfeachedges: [];
  captureEvent: any;
  invalidMinRadius: boolean;
  invalidMaxRadius: boolean;
  sameDayOrdering: boolean;
  scheduleId: number;
  hubriseConnected: boolean;

  constructor(
    private fb: FormBuilder,
    private store: Store<StoresState>,
    private route: Router,
    private activeRoute: ActivatedRoute,
    private toaster: ToastrService,
    private translateSer: TranslateService,
    private scheduleServ: StoresScheduleService
  ) { }

  ngOnInit() {

    this.activeRoute.queryParams.subscribe(param => this.setupZone = param.type);
    document.getElementById('settingsTabs').style.display = 'none';
    document.getElementById('settingsHeader').style.display = 'none';
    const params = this.activeRoute.params as { [key: string]: any };
    this.zoneId = params._value.zoneid;
    this.storeid = this.activeRoute.snapshot.parent.params.id;
    this.schedules$ = this.scheduleServ.getAllSchedules(this.storeid);
    this.zoneForm = this.fb.group({
      minRadius: ['', Validators.compose([Validators.required, Validators.pattern('(([1-9]{1})([0-9]*)|0)(\\.[0-9]{1,})?')])],
      maxRadius: ['', Validators.compose([Validators.required, Validators.pattern('(([1-9]{1})([0-9]*)|0)(\\.[0-9]{1,})?')])],
      name: [''],
      type: this.setupZone,
      radiusUnit: [this.units[0]],
      orderFeeDelivery: ['', Validators.compose([Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      orderAmountFreeDelivery: ['', Validators.compose([Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      orderMinAmountDelivery: ['', Validators.compose([Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      postcodes: [''],
      scheduleId: [''],
      polygon: [''],
      deliveryFeeExternalId: ['', Validators.compose([Validators.maxLength(100)])]
    });

    if (this.setupZone !== 'RADIUS') {
      // tslint:disable
      this.zoneForm.controls['minRadius'].clearValidators();
      this.zoneForm.controls['maxRadius'].clearValidators();
      // tslint:enable
    }

    this.store
      .pipe(
        select(getStoreSingleZoneStatus),
        takeUntil(this.destroyed$),
      )
      .subscribe(s => {
        this.zoneStatus = s;
      });
    // tslint:disable-next-line
    this.zoneForm.controls['minRadius'].valueChanges.subscribe(value => {
      this.onValidatedRadius(value, 'min');
    });
    // tslint:disable-next-line
    this.zoneForm.controls['maxRadius'].valueChanges.subscribe(value => {
      this.onValidatedRadius(value, 'max');
    });
    this.scheduleId = 0;

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$),
    ).subscribe(s => {
      if (s.settings.HUBRISE_ACCESS_TOKEN && s.settings.HUBRISE_LOCATION_NAME &&
        s.settings.HUBRISE_CATALOG_NAME && s.settings.HUBRISE_CUSTOMER_LIST_NAME) {
          this.hubriseConnected = true;
        } else {
          this.hubriseConnected = false;
        }
    });
  }

  ngAfterViewInit() {
    if (this.setupZone === 'POLYGON' && +this.zoneId === 0) {
      this.store.pipe(
        select(getSelectedStore),
        takeUntil(this.destroyed$)
      ).subscribe(storeData => {
        this.initializeMap(storeData.coordinates.latitude, storeData.coordinates.longitude);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const zone = changes.zone;
    if (zone.currentValue && this.zoneForm) {
      this.zoneForm.patchValue(zone.currentValue);
      // tslint:disable-next-line
      this.zoneForm.controls['deliveryFeeExternalId']?.setValue(zone.currentValue.settings?.DELIVERY_FEE_EXTERNAL_ID);
      // tslint:disable-next-line
      this.scheduleId =  this.zoneForm.controls['scheduleId']?.value;
      if (this.setupZone === 'POLYGON') {
        combineLatest([
          this.store.pipe(select(getSelectedStore)),
          this.store.pipe(select(getStoreSingleZoneStatus))
        ])
          .pipe(
            filter(([storeData, zoneStatus]) => zoneStatus === 'LOADED'),
            takeUntil(this.destroyed$))
          .subscribe(([storeData, zoneStatus]) => {
            setTimeout(() => {
              this.initializeMap(storeData.coordinates.latitude, storeData.coordinates.longitude);
            }, 500);
          });
      }
    }
  }

  ngOnDestroy() {
    document.getElementById('settingsTabs').removeAttribute('style');
    document.getElementById('settingsHeader').removeAttribute('style');

    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onValidatedRadius(value, input) {
    const regex = new RegExp('(([1-9]{1})([0-9]*)|0)(\\.[0-9]{1,})?');
    //tslint:disable
    if (regex.test(value) === true) {
      if (input === 'min') {
        this.zoneForm.controls['minRadius'].valid;
        this.invalidMinRadius = false;
      }
      else {
        this.zoneForm.controls['maxRadius'].valid;
        this.invalidMaxRadius = false;
      }
    }
    else {
      if (input === 'min') {
        this.zoneForm.controls['minRadius'].invalid;
        this.invalidMinRadius = true;
      }
      else {
        this.zoneForm.controls['maxRadius'].invalid;
        this.invalidMaxRadius = true;
      }
    }
    // tslint:enable
  }

  onPartialSubmit() {
    if (this.zoneForm.valid) {
      this.store.dispatch(new PartialUpdateStore(this.zoneForm.getRawValue()));
    }
  }

  getControl(name: string) {
    return this.zoneForm.get(name);
  }

  onSubmit() {
    this.zoneForm.markAllAsTouched();
    if (this.getControl('type').value === 'POSTCODE') {
      this.zoneForm.removeControl('maxRadius');
      this.zoneForm.removeControl('polygon');
      this.zoneForm.removeControl('minRadius');
      this.zoneName = this.getControl('name').value;
    }
    if (this.getControl('type').value === 'RADIUS') {
      this.zoneForm.removeControl('polygon');
      this.zoneName =
        this.getControl('minRadius').value + this.getControl('radiusUnit').value + '-' +
        this.getControl('maxRadius').value + this.getControl('radiusUnit').value;
    }
    if (!this.zoneForm.value.postcodes && this.getControl('type').value === 'POSTCODE') {
      this.toaster.error(this.translateSer.instant('admin.store.postCodemsg'), this.translateSer.instant('admin.store.message.actionFail'));
      return;
    }
    else if (this.getControl('type').value !== 'POLYGON') {
      this.zoneForm.get('postcodes').setValue(
        this.zoneForm.controls.postcodes.value.trim().replace(/\n|\r/g, ',').replace(/[,]+/g, ',').replace(/[ ]+/g, ' ')
      );
    }
    if (this.getControl('type').value === 'POLYGON') {
      this.zoneName = this.getControl('name').value;
      if (this.zoneId > 0) {
        for (const polygon of this.polygons) {
          const editcoordinates = { longitude: polygon.lng, latitude: polygon.lat };
          this.updatePolygons.push(editcoordinates);
        }
        this.zoneForm.get('polygon').setValue(this.updatePolygons);
      }
      else {
        this.zoneForm.get('polygon').setValue(this.polygons);
      }
    }
    this.zoneForm.get('name').setValue(this.zoneName);

    if (this.sameDayOrdering !== undefined && this.sameDayOrdering !== null) {
      this.store.dispatch(new UpdateStoreZoneSettings(this.zoneId, {
        DISABLE_SAME_DAY_ORDERING: !this.sameDayOrdering
      }));
    }

    if (this.zoneForm.valid) {
      this.store.dispatch(new UpdateStoreZoneSettings(this.zoneId, {
        DELIVERY_FEE_EXTERNAL_ID: this.getControl('deliveryFeeExternalId').value
      }));
      this.store.dispatch(new CreateOrUpdateZone(this.zoneForm.value, parseInt(this.zoneId.toString(), 10)));
    }
  }

  initializeMap(lat, long) {
    const lngLat = new google.maps.LatLng(lat, long);
    const mapOptions = {
      zoom: 13,
      center: lngLat,
      scrollwheel: false
    };
    const marker = new google.maps.Marker({
      position: lngLat
    });
    if (this.zoneId > 0 && this.mapElement) {
      const map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      marker.setMap(map);
      for (const val of this.getControl('polygon').value) {
        const arrayofcoordinates = {
          lng: val.longitude,
          lat: val.latitude
        };
        this.polygons.push(arrayofcoordinates);
      }
      const polygonmap = new google.maps.Polygon({
        paths: this.polygons,
      });
      polygonmap.setMap(map);
    }
    else {
      const map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      marker.setMap(map);
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYGON,
          ],
        },
        polygonOptions: {
          draggable: true,
          editable: true
        },
      });
      drawingManager.setMap(map);
      google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
        if (this.captureEvent) {
          this.captureEvent.setMap(null);
          this.coordinatesOfeachedges = [];
          this.polygons = [];
        }
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          this.captureEvent = event.overlay;
          const polygon = event.overlay.getPath().getArray();
          this.coordinatesOfeachedges = polygon.map((a) => [a.lng(), a.lat()]);
          for (const coordinatesOfeachedge of this.coordinatesOfeachedges) {
            const arrayofcoordinates = { longitude: coordinatesOfeachedge[0], latitude: coordinatesOfeachedge[1] };
            this.polygons.push(arrayofcoordinates);
          }
        }
      });
    }
  }

  deleteZone() {
    this.store.dispatch(new RemoveZone(this.zoneId, this.storeid));
  }

  goBack(event) {
    if (event !== undefined) {
      event.preventDefault();
    }
    this.route.navigate([`/manager/stores/${this.storeid}/settings/address`]);
  }

  toggleSetting(e) {
    this.sameDayOrdering = e.target.checked;
  }

  selectScheduleIdHandler($event){
    this.scheduleId = $event.target.value;
  }
}
