/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommentModel } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class ListCommentService {
  constructor(private httpClient: HttpClient) {}

  public getAll(electionId: string, listId: string): Observable<CommentModel[]> {
    return this.httpClient.get<CommentModel[]>(this.url(electionId, listId));
  }

  public create(
    electionId: string,
    listId: string,
    comment: CommentModel,
    theme: string
  ): Observable<CommentModel> {
    return this.httpClient.post<CommentModel>(
      `${this.url(electionId, listId)}?theme=${encodeURIComponent(theme)}`,
      comment
    );
  }

  public update(electionId: string, listId: string, comment: CommentModel): Observable<CommentModel> {
    return this.httpClient.put<CommentModel>(this.url(electionId, listId, comment.id), comment);
  }

  public delete(electionId: string, listId: string, id: string): Observable<void> {
    return this.httpClient.delete<void>(this.url(electionId, listId, id));
  }

  private url(electionId: string, listId: string, commentId?: string): string {
    const optionalEncodedCommentId = commentId ? '/' + encodeURIComponent(commentId) : '';
    return (
      environment.eawv +
      `/elections/${encodeURIComponent(electionId)}/lists/${encodeURIComponent(listId)}/comments${optionalEncodedCommentId}`
    );
  }
}
