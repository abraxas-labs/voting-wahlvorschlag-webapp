/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CountryModel } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private httpClient = inject(HttpClient);
  public getAll(): Observable<CountryModel[]> {
    return this.httpClient.get<CountryModel[]>(this.url());
  }

  private url(): string {
    return environment.eawv + '/countries';
  }
}
