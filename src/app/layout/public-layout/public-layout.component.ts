import { Component, OnInit, Inject } from '@angular/core';
import { WINDOW } from '../../public/window-providers';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent implements OnInit {

  subdomain: string;
  constructor(@Inject(WINDOW) private window: Window) { }

  ngOnInit() {
    this.getSubdomain();
  }

  getSubdomain() {
    const domain = this.window.location.hostname;
    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      this.subdomain = '';
    } else {
      this.subdomain = domain.split('.')[0];
    }
    console.log('subdomain', this.subdomain);
  }

}
