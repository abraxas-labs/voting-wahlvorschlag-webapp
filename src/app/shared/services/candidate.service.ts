/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CandidateModel } from '../models/candidate.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { DateUtils } from '../utils/date-utils';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private httpClient = inject(HttpClient);

  public getAll(electionId: string, listId: string): Observable<CandidateModel[]> {
    return this.httpClient
      .get<CandidateModel[]>(this.url(electionId, listId))
      .pipe(map((c) => this.mapCandidates(c)));
  }

  public batchUpdate(
    electionId: string,
    listId: string,
    candidates: CandidateModel[]
  ): Observable<CandidateModel[]> {
    for (const candidate of candidates) {
      this.patchDates(candidate);
    }
    return this.httpClient
      .put<CandidateModel[]>(`${this.url(electionId, listId)}/batch`, candidates)
      .pipe(map((c) => this.mapCandidates(c)));
  }

  private url(electionId: string, listId: string): string {
    return (
      environment.eawv +
      `/elections/${encodeURIComponent(electionId)}/lists/${encodeURIComponent(listId)}/candidates`
    );
  }

  private mapCandidates(candidates: CandidateModel[]): CandidateModel[] {
    return candidates.map((l) => this.mapCandidate(l));
  }

  private patchDates(candidate: CandidateModel): void {
    candidate.dateOfBirth = DateUtils.dateToUtcString(new Date(candidate.dateOfBirth)) as Date;
  }

  private mapCandidate(candidate: CandidateModel): CandidateModel {
    const dateOfBirth = DateUtils.dateFromUtcString(candidate.dateOfBirth);
    return { ...candidate, dateOfBirth: dateOfBirth };
  }
}
