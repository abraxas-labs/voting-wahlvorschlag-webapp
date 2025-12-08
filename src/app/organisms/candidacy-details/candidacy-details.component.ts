/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, inject } from '@angular/core';
import { CandidateModel } from 'src/app/shared/models/candidate.model';
import { SettingsModel } from '../../shared/models/settings.model';
import { ElectionModel, ElectionType } from '../../shared/models/election.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-candidacy-details',
  templateUrl: './candidacy-details.component.html',
  styleUrls: ['./candidacy-details.component.scss'],
  standalone: false,
})
export class CandidacyDetailsComponent {
  public readonly data = inject(MAT_DIALOG_DATA);

  public candidacy: CandidateModel;
  public election: ElectionModel;
  public listId: string;
  public settings: SettingsModel;

  constructor() {
    this.election = this.data.data.election;
    this.settings = this.data.data.settings;
    this.candidacy = this.data.data.candidacy;
    this.listId = this.data.data.listId;
  }

  public get isMajorz(): boolean {
    return this.election && this.election.electionType === ElectionType.Majorz;
  }

  public isTagged(field: string): boolean {
    if (!this.candidacy || !this.candidacy.markings) {
      return false;
    }
    return this.candidacy.markings.findIndex((f) => f.field === field) !== -1;
  }
}
