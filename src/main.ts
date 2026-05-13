/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideZoneChangeDetection } from '@angular/core';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] })
  .catch((err) => console.log(err));
