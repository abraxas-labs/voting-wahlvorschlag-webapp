/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InfoTextModel } from '../models/info-text.model';

@Injectable({
  providedIn: 'root',
})
export class InfoTextService {
  private httpClient = inject(HttpClient);

  public getAll(electionId?: string): Observable<InfoTextModel[]> {
    let params = new HttpParams();
    if (electionId) {
      params = params.set('electionId', electionId);
    }
    return this.httpClient.get<InfoTextModel[]>(this.url(), { params });
  }

  public set(infoText: Partial<InfoTextModel>): Observable<InfoTextModel> {
    return this.httpClient.post<InfoTextModel>(this.url(), infoText);
  }

  public setMany(infoTexts: Partial<InfoTextModel>[]): Observable<InfoTextModel> {
    return this.httpClient.post<InfoTextModel>(`${this.url()}/batch`, infoTexts);
  }

  public get(key: string, electionId?: string): Observable<InfoTextModel> {
    const params = new HttpParams();
    if (electionId) {
      params.set('electionId', electionId);
    }
    return this.httpClient.get<InfoTextModel>(this.url(key), { params });
  }

  public delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(this.url(id));
  }

  private url(id?: string): string {
    const optionalEncodedId = id ? '/' + encodeURIComponent(id) : '';
    return environment.eawv + `/infotexts${optionalEncodedId}`;
  }
}
