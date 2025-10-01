/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input, OnInit } from '@angular/core';
import { CommentModel } from 'src/app/shared/models/comment.model';
import { ListCommentService } from 'src/app/shared/services/list-comment.service';
import { RxJsUtilsService } from 'src/app/shared/services/rx-js-utils.service';
import { finalize, map } from 'rxjs/operators';
import { CachedUserService } from '../../shared/services/cached-user.service';
import { User } from '@abraxas/base-components';
import { ThemeService } from '@abraxas/voting-lib';
import { ElectionModel } from 'src/app/shared/models/election.model';
import { ListModel, ListState } from '../../shared/models/list.model';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  standalone: false,
})
export class CommentsComponent implements OnInit {
  @Input()
  public election: ElectionModel;
  @Input()
  public list: ListModel;

  public editingComment: CommentModel = { content: '', creatorFirstName: '', creatorLastName: '' };
  public comments: CommentModel[] = [];
  public loading: boolean = false;
  public saving: boolean = false;
  public removingId?: string = null;
  public activeUser: User;
  public canEditOrDeleteComments: boolean = false;
  private theme: string;

  constructor(
    public cachedUserService: CachedUserService,
    private commentService: ListCommentService,
    private rxUtils: RxJsUtilsService,
    private readonly themeService: ThemeService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.cachedUserService
      .getActiveTenant()
      .pipe(this.rxUtils.toastDefault())
      .subscribe(() => {
        this.canEditOrDeleteComments = this.list.state === ListState.Draft || this.list.state === ListState.Submitted;
        this.loadComments();
        this.cachedUserService.getCurrentUser().subscribe((u) => (this.activeUser = u));
      });

    this.themeService.theme$.subscribe((theme) => {
      this.theme = theme;
    });
  }

  public loadComments(): void {
    this.loading = true;

    this.commentService
      .getAll(this.election.id, this.list.id)
      .pipe(
        this.rxUtils.toastDefault(),
        map((cs) => cs.sort((a, b) => (a.creationDate > b.creationDate ? -1 : 1))),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(async (cs) => {
        this.comments = cs;
      });
  }

  public editComment(comment: CommentModel): void {
    if (!comment) {
      this.editingComment = { content: '', creatorFirstName: '', creatorLastName: '' };
    }
    this.editingComment = { ...comment };
  }

  public deleteComment(id: string): void {
    this.removingId = id;
    this.commentService
      .delete(this.election.id, this.list.id, id)
      .pipe(
        finalize(() => {
          this.removingId = null;
        })
      )
      .subscribe(() => {
        this.loadComments();
      });
  }

  public saveComment(): void {
    this.saving = true;
    if (this.editingComment.id) {
      this.commentService
        .update(this.election.id, this.list.id, this.editingComment)
        .pipe(
          this.rxUtils.toastDefault(),
          finalize(() => {
            this.saving = false;
          })
        )
        .subscribe(() => {
          this.editComment(null);
          this.loadComments();
        });
      return;
    }

    this.commentService
      .create(this.election.id, this.list.id, this.editingComment, this.theme)
      .pipe(
        this.rxUtils.toastDefault(),
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe(() => {
        this.editComment(null);
        this.loadComments();
      });
  }
}
