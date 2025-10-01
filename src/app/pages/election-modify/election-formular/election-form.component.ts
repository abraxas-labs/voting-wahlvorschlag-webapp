/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ElectionModel } from '../../../shared/models/election.model';
import { DocumentModel } from '../../../shared/models/document.model';
import { BallotDocumentService } from '../../../shared/services/ballot-document.service';
import { InfoTextModel } from 'src/app/shared/models/info-text.model';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-election-form',
  templateUrl: './election-form.component.html',
  styleUrls: ['./election-form.component.scss'],
  standalone: false,
})
export class ElectionFormComponent implements OnInit {
  @Input() public election!: ElectionModel;
  @Output() public isValidChange: EventEmitter<boolean> = new EventEmitter(true);
  @Output() public infoTextsChange: EventEmitter<Partial<InfoTextModel>[]> = new EventEmitter<
    Partial<InfoTextModel>[]
  >();
  @Output() public electionChange: EventEmitter<ElectionModel> = new EventEmitter();

  constructor(
    private documentService: BallotDocumentService,
    private snackbarService: SnackbarService
  ) {}

  public ngOnInit(): void {
    this.isValidChange.emit(true);
  }

  public addFile(doc: DocumentModel): void {
    if (!this.election.id) {
      this.election.documents.push(doc);
      return;
    }

    this.documentService.create(this.election.id, doc).subscribe(
      (createdDoc) => {
        this.snackbarService.success('DOCUMENT.MSG_CREATED');
        doc.id = createdDoc.id;
        this.election.documents.push(doc);
      },
      () => this.snackbarService.error('DOCUMENT.MSG_CREATED_FAILED')
    );
  }

  public removeFileAtIndex(index: number): void {
    const document = this.election.documents[index];
    if (!document.id || !this.election.id) {
      this.election.documents.splice(index, 1);
      return;
    }

    this.documentService.delete(String(this.election.id), document.id).subscribe(
      () => {
        this.snackbarService.success('DOCUMENT.MSG_DELETED');
        this.election.documents.splice(index, 1);
      },
      () => this.snackbarService.error('DOCUMENT.MSG_DELETED_FAILED')
    );
  }

  public set quorumSignaturesCount(count: number) {
    if (!this.election) {
      return;
    }
    this.election.quorumSignaturesCount = count;
  }

  public get quorumSignaturesCount(): number {
    if (!this.election) {
      return 0;
    }
    return this.election.quorumSignaturesCount || 0;
  }

  public set infoTexts(texts: InfoTextModel[]) {
    if (!this.election) {
      return;
    }
    this.election.infoTexts = texts;
  }

  public get infoTexts(): InfoTextModel[] {
    if (!this.election) {
      return [];
    }
    return this.election.infoTexts || [];
  }

  public infoTextsChanged(infoTexts: Partial<InfoTextModel>[]): void {
    this.infoTextsChange.emit(infoTexts);
  }
}
