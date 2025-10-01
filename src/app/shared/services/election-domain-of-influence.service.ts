/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ElectionDomainOfInfluenceModel } from '../models/election-domain-of-influence.model';

@Injectable({
  providedIn: 'root',
})
export class ElectionDomainOfInfluenceService {
  constructor(private httpClient: HttpClient) {}

  public create(
    electionId: string,
    doi: ElectionDomainOfInfluenceModel
  ): Observable<ElectionDomainOfInfluenceModel> {
    return this.httpClient.post<ElectionDomainOfInfluenceModel>(this.url(electionId), doi);
  }

  public update(
    electionId: string,
    id: string,
    doi: ElectionDomainOfInfluenceModel
  ): Observable<ElectionDomainOfInfluenceModel> {
    return this.httpClient.put<ElectionDomainOfInfluenceModel>(this.url(electionId, id), doi);
  }

  public delete(electionId: string, id: string): Observable<void> {
    return this.httpClient.delete<void>(this.url(electionId, id));
  }

  private url(electionId: string, domainOfInfluenceId?: string): string {
    const optionalEncodedDoiId = domainOfInfluenceId ? '/' + encodeURIComponent(domainOfInfluenceId) : '';
    return (
      environment.eawv +
      `/elections/${encodeURIComponent(electionId)}/domainofinfluences${optionalEncodedDoiId}`
    );
  }
}
