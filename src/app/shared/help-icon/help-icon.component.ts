import { Component, OnInit, Input } from '@angular/core';
import {HelpUrl as url} from './help-url.enum';
import {HelpText as text} from './help-text.enum';
import {environment as envConst} from '../../../environments/environment';
@Component({
  selector: 'app-help-icon',
  templateUrl: './help-icon.component.html',
  styleUrls: ['./help-icon.component.scss']
})
export class HelpIconComponent implements OnInit {

  @Input() helpPageName: string;

  pageUrl: string;
  displayText: string;
  constructor() { }

  ngOnInit() {
    this.pageUrl = envConst.helpHostURL + url[this.helpPageName];
    this.displayText = text[this.helpPageName];
  }

}
