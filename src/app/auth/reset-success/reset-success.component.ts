
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
@Component({
  selector: 'app-reset-success',
  templateUrl: './reset-success.component.html',
  styleUrls: ['./reset-success.component.scss']
})
export class ResetSuccessComponent implements OnInit {

  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }
  onLocaleChange(e) {
    this.translate.use(e.locale);
  }
}
