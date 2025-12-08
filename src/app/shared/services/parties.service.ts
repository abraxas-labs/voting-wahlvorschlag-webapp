/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PartyModel } from '../models/party.model';

@Injectable({
  providedIn: 'root',
})
export class PartiesService {
  private httpClient = inject(HttpClient);

  public getAll(): Observable<PartyModel[]> {
    return this.httpClient.get<PartyModel[]>(this.url());
  }

  public create(name: string): Observable<void> {
    const request = { name: name };
    return this.httpClient.post<void>(this.url(), request);
  }

  public delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(this.url(id));
  }

  private url(id?: string): string {
    const optionalEncodedId = id ? '/' + encodeURIComponent(id) : '';
    return environment.eawv + `/parties${optionalEncodedId}`;
  }
}
