/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DomainOfInfluenceModel } from '../models/domainOfInfluence.model';
import { switchMap, map } from 'rxjs/operators';
import { AuthorizationService } from '@abraxas/base-components';

@Injectable({
  providedIn: 'root',
})
export class ElectoralDistrictService {
  constructor(
    private httpClient: HttpClient,
    private auth: AuthorizationService
  ) {}

  public getAll(): Observable<DomainOfInfluenceModel[]> {
    return this.httpClient.get<DomainOfInfluenceModel[]>(this.url());
  }

  public create(data: DomainOfInfluenceModel): Observable<DomainOfInfluenceModel> {
    return from(this.auth.getActiveTenant()).pipe(
      map((t) => (data.tenantId = t.id)),
      switchMap(() => this.httpClient.post<DomainOfInfluenceModel>(this.url(), data))
    );
  }

  public get(id: string): Observable<DomainOfInfluenceModel> {
    return this.httpClient.get<DomainOfInfluenceModel>(this.url(id));
  }

  public delete(id: string): Observable<any> {
    return this.httpClient.delete(this.url(id));
  }

  public update(data: DomainOfInfluenceModel): Observable<DomainOfInfluenceModel> {
    return this.httpClient.put<DomainOfInfluenceModel>(this.url(data.id), data);
  }

  private url(id?: string): string {
    const optionalEncodedId = id ? '/' + encodeURIComponent(id) : '';
    return environment.eawv + `/domainofinfluences${optionalEncodedId}`;
  }
}
