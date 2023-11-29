import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { Store } from '@ngrx/store';
import { StoreLocationService } from '../stores/store-location/store-location.service';
import { WindowRefService } from '../window.service';
import { filter, withLatestFrom, take, switchMap, map, tap } from 'rxjs/operators';
import { DownloadLocationQRImage, DownloadLocationQRPdf } from '../stores/store-location/+state/store-location.actions';
import { helpPage } from 'src/app/shared/help-page.const';


@Component({
  selector: 'app-qr-codes-location',
  templateUrl: './qr-codes-location.component.html',
  styleUrls: ['./qr-codes-location.component.scss']
})
export class QrCodesLocationComponent implements OnInit {

  private window: Window;
  @Input() location: any;
  @Input() locationLabel: any;
  @Input() clientStoreId: any;
  @ViewChild('qrImage', { static: true }) image: ElementRef;
  qrCodesLocationHelpPage = helpPage.locations;

  constructor(private store: Store<any>, private service: StoreLocationService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.window = this.windowRefService.nativeWindow;

    this.service.downloadQRImage(this.clientStoreId, this.location)
      .subscribe((b: any) => this.image.nativeElement.src = this.window[`URL`].createObjectURL(b.blob));
  }

  downloadImage() {
    this.store.dispatch(new DownloadLocationQRImage(this.clientStoreId, this.location));
  }

  downloadPdf() {
    this.store.dispatch(new DownloadLocationQRPdf(this.clientStoreId, this.location));
  }
}
