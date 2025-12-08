/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SettingsModel } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private httpClient = inject(HttpClient);

  private get url(): string {
    return environment.eawv + '/settings/';
  }

  public get(): Observable<SettingsModel> {
    return this.httpClient.get<SettingsModel>(this.url);
  }

  public update(settings: Partial<SettingsModel>): Observable<SettingsModel> {
    return this.httpClient.patch<SettingsModel>(this.url, settings);
  }
}
