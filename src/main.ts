
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/angular';

// Load google analytics only in prod environment
if (environment.name === 'production') {

  const gtagScript = document.createElement('script');
  gtagScript.type = 'text/javascript';
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=UA-161479475-1';
  document.head.appendChild(gtagScript);

  const gtagConfigScript = document.createElement('script');
  gtagConfigScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-161479475-1');
  `;
  document.head.appendChild(gtagConfigScript);

  // add Google Analytics script to <head>
  const gtagInitScript = document.createElement('script');
  gtagInitScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-N7V3DDF');`;
  document.head.appendChild(gtagInitScript);

  const RMSScript = document.createElement('script');
  RMSScript.type = 'text/javascript';
  RMSScript.src = 'assets/rxp-js.js';
  document.head.appendChild(RMSScript);

  const paymentSenseScript = document.createElement('script');
  paymentSenseScript.type = 'text/javascript';
  paymentSenseScript.src = 'https://web.e.connect.paymentsense.cloud/assets/js/client.js';
  document.head.appendChild(paymentSenseScript);

  const squareScript = document.createElement('script');
  squareScript.type = 'text/javascript';
  squareScript.src = 'https://js.squareup.com/v2/paymentform';
  document.head.appendChild(squareScript);

  const vivaScript = document.createElement('script');
  vivaScript.type = 'text/javascript';
  vivaScript.src = 'https://www.vivapayments.com/web/checkout/v2/js';
  document.head.appendChild(vivaScript);

} else {

  const RMSScript = document.createElement('script');
  RMSScript.type = 'text/javascript';
  RMSScript.src = 'assets/rxp-js.js';
  document.head.appendChild(RMSScript);

  const paymentSenseScript = document.createElement('script');
  paymentSenseScript.type = 'text/javascript';
  paymentSenseScript.src = 'https://web.e.test.connect.paymentsense.cloud/assets/js/client.js';
  document.head.appendChild(paymentSenseScript);

  const squareScript = document.createElement('script');
  squareScript.type = 'text/javascript';
  squareScript.src = 'https://js.squareupsandbox.com/v2/paymentform';
  document.head.appendChild(squareScript);

  const vivaScript = document.createElement('script');
  vivaScript.type = 'text/javascript';
  vivaScript.src = 'https://demo.vivapayments.com/web/checkout/v2/js';
  document.head.appendChild(vivaScript);
}

if (environment.production) {
  enableProdMode();
}

if (environment.name !== 'local') {

  Sentry.init({
    dsn: 'https://5d3d0a9d077f48fc8660b419ebdd8cdd@o541440.ingest.sentry.io/5660361',
    environment: environment.name,
    integrations: [
      // Registers and configures the Tracing integration,
      // which automatically instruments your application to monitor its
      // performance, including custom Angular routing instrumentation
      new Integrations.BrowserTracing({
        tracingOrigins: ['localhost', 'https://admin.gonnaorder.com'],
        routingInstrumentation: Sentry.routingInstrumentation,

      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
