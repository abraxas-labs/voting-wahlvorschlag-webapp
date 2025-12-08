/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GuardService } from '../../shared/guard.service';
import { ElectionExportType, ElectionModel, ElectionType } from '../../shared/models/election.model';
import { ListExportType, ListModel } from '../../shared/models/list.model';
import { ElectionService } from '../../shared/services/election.service';
import { ListService } from '../../shared/services/list.service';
import { EnumValues } from '../../shared/utils/enum-utils';

@Component({
  selector: 'app-list-export',
  templateUrl: './list-export.component.html',
  styleUrls: ['./list-export.component.scss'],
  standalone: false,
})
export class ListExportComponent {
  private listService = inject(ListService);
  private electionService = inject(ElectionService);

  @Input()
  public election: ElectionModel;

  @Input()
  public lists: ListModel[];

  @Output()
  public cancelEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public listExport: EventEmitter<ListExportType> = new EventEmitter<ListExportType>();

  @Output()
  public electionExport: EventEmitter<ElectionExportType> = new EventEmitter<ElectionExportType>();

  public listExportTypes: ListExportType[] = EnumValues<ListExportType>(ListExportType);
  public electionExportTypes: ElectionExportType[] = EnumValues<ElectionExportType>(ElectionExportType);

  public exportingElection: boolean = false;
  public exportingList: boolean = false;
  private isWahlverwalter: boolean = false;

  constructor() {
    const roleService = inject(GuardService);

    roleService.isWahlverwalter().subscribe((isW) => (this.isWahlverwalter = isW));
  }

  public exportElection(type: ElectionExportType): void {
    this.exportingElection = true;
    let format: string;
    switch (type) {
      case ElectionExportType.Candidates:
      case ElectionExportType.FederalChancellery:
        format = 'Csv';
        break;
      case ElectionExportType.ECH157:
        format = 'Xml';
        break;
      default:
        format = 'Pdf';
    }

    this.electionService
      .export(this.election.id, type, format, this.lists)
      .pipe(finalize(() => (this.exportingElection = false)))
      .subscribe(() => this.electionExport.emit(type));
  }

  public exportList(type: ListExportType): void {
    this.exportingList = true;
    const exportObervables = [];
    for (const list of this.lists) {
      exportObervables.push(this.listService.export(this.election.id, list.id, type));
    }
    forkJoin(exportObervables)
      .pipe(finalize(() => (this.exportingList = false)))
      .subscribe(() => {
        this.listExport.emit(type);
      });
  }

  public isElectionExportHidden(type: ElectionExportType): boolean {
    switch (type) {
      case ElectionExportType.Candidates:
        return this.lists.length === 0;
      case ElectionExportType.ECH157:
        return this.lists.length === 0 || !this.isWahlverwalter;
      case ElectionExportType.EmptyListUnions:
        return this.election.electionType === ElectionType.Majorz;
      case ElectionExportType.FederalChancellery:
        return !this.isWahlverwalter || this.election.electionType === ElectionType.Majorz;
      case ElectionExportType.EmptyCandidates:
      case ElectionExportType.EmptySignatories:
        return !this.isWahlverwalter;
      default:
        return false;
    }
  }

  public isListExportHidden(type: ListExportType): boolean {
    return type === ListExportType.WabstiCandidates && !this.isWahlverwalter;
  }
}
