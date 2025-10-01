/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentModel } from '../models/document.model';
import { DownloadService } from './download.service';

@Injectable({
  providedIn: 'root',
})
export class BallotDocumentService {
  constructor(
    private httpClient: HttpClient,
    private downloader: DownloadService
  ) {}

  public create(electionId: string, document: DocumentModel): Observable<DocumentModel> {
    return this.httpClient.post<DocumentModel>(this.url(electionId), document);
  }

  public get(electionId: string, id: string): Observable<DocumentModel> {
    return this.httpClient.get<DocumentModel>(this.url(electionId, id));
  }

  public delete(electionId: string, id: string): Observable<void> {
    return this.httpClient.delete<void>(this.url(electionId, id));
  }

  public download(electionId: string, id: string): void {
    this.get(electionId, id).subscribe((doc) => this.downloader.downloadFromBase64(doc.name, doc.document));
  }

  private url(electionId: string, documentId?: string): string {
    const optionalEncodedDocumentId = documentId ? '/' + encodeURIComponent(documentId) : '';
    return (
      environment.eawv + `/elections/${encodeURIComponent(electionId)}/documents${optionalEncodedDocumentId}`
    );
  }
}
