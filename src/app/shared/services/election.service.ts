/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { ElectionExportType, ElectionModel, ElectionOverviewModel } from '../models/election.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DownloadService } from './download.service';
import { ListService } from './list.service';
import { ListModel } from '../models/list.model';

@Injectable({
  providedIn: 'root',
})
export class ElectionService {
  constructor(
    private httpClient: HttpClient,
    private download: DownloadService
  ) {}

  public getAll(): Observable<ElectionOverviewModel[]> {
    return this.httpClient
      .get<ElectionOverviewModel[]>(this.url())
      .pipe(
        map((elections) => elections.map((election) => this.mapElection<ElectionOverviewModel>(election)))
      );
  }

  public create(election: ElectionModel): Observable<ElectionModel> {
    return this.httpClient.post<ElectionModel>(this.url(), election);
  }

  public get(id: string): Observable<ElectionModel> {
    return this.httpClient
      .get<ElectionModel>(this.url(id))
      .pipe(map((election) => this.mapElection<ElectionModel>(election)));
  }

  public update(election: ElectionModel): Observable<ElectionModel> {
    return this.httpClient.put<ElectionModel>(this.url(election.id), election);
  }

  public delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(this.url(id));
  }

  public export(
    electionId: string,
    type: ElectionExportType,
    format: string,
    lists: ListModel[]
  ): Observable<void> {
    let params = `?format=${encodeURIComponent(format)}`;
    if (lists && lists.length > 0) {
      params += '&listIds=' + lists.map((l) => encodeURIComponent(l.id)).join('&listIds=');
    }
    return this.download.download(`${this.url(electionId)}/export/${encodeURIComponent(type)}${params}`);
  }

  private mapElection<T>(election: any): T {
    election.creationDate = new Date(election.creationDate);
    election.modifiedDate = election.modifiedDate ? new Date(election.modifiedDate) : undefined;
    election.submissionDeadlineBegin = new Date(election.submissionDeadlineBegin);
    election.submissionDeadlineEnd = new Date(election.submissionDeadlineEnd);
    election.contestDate = new Date(election.contestDate);
    election.availableFrom = election.availableFrom ? new Date(election.availableFrom) : undefined;

    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(election.submissionDeadlineEnd);
    deadlineDate.setHours(0, 0, 0, 0);

    const timeDiff = Math.max(0, deadlineDate.getTime() - nowDate.getTime());
    election.submissionDeadlineDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (election.lists) {
      election.lists = ListService.mapLists(election.lists);
    }

    return election;
  }

  private url(id?: string): string {
    const optionalEncodedId = id ? '/' + encodeURIComponent(id) : '';
    return environment.eawv + `/elections${optionalEncodedId}`;
  }
}
