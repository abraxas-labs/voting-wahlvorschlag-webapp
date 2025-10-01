/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ElectionModel } from 'src/app/shared/models/election.model';
import { InfoTextModel } from 'src/app/shared/models/info-text.model';

@Component({
  selector: 'app-election-info-texts',
  templateUrl: './election-info-texts.component.html',
  standalone: false,
})
export class ElectionInfoTextsComponent {
  @Input() public election!: ElectionModel;
  @Output() public infoTextsChange: EventEmitter<Partial<InfoTextModel>[]> = new EventEmitter<
    Partial<InfoTextModel>[]
  >();
  @Output() public electionChange: EventEmitter<ElectionModel> = new EventEmitter<ElectionModel>();

  public infoTextsChanged(infoTexts: Partial<InfoTextModel>[]): void {
    this.infoTextsChange.emit(infoTexts);
  }
}
