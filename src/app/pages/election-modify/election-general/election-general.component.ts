/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ElectionModel, ElectionType } from '../../../shared/models/election.model';
import { ElectoralDistrictService } from '../../../shared/services/electoral-district.service';
import { DomainOfInfluenceModel } from '../../../shared/models/domainOfInfluence.model';
import { ElectionDomainOfInfluenceService } from '../../../shared/services/election-domain-of-influence.service';
import { ElectionDomainOfInfluenceModel } from '../../../shared/models/election-domain-of-influence.model';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-election-general',
  templateUrl: './election-general.component.html',
  styleUrls: ['./election-general.component.scss'],
  standalone: false,
})
export class ElectionGeneralComponent implements OnInit, OnChanges {
  @Input() public election: ElectionModel;
  @Output() public electionChange: EventEmitter<ElectionModel> = new EventEmitter();
  @Output() public isValidChange: EventEmitter<boolean> = new EventEmitter(true);

  public isValid: boolean = false;
  public electionTypes: typeof ElectionType = ElectionType;
  public electoralDistricts: DomainOfInfluenceModel[] = [];
  public majorzButton: 'primary' | 'secondary' | 'tertiary' | 'tertiary-tonal';
  public proporzButton: 'primary' | 'secondary' | 'tertiary' | 'tertiary-tonal';

  constructor(
    private electoralDistrictService: ElectoralDistrictService,
    private electionDomainOfInfluenceService: ElectionDomainOfInfluenceService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private changeDetect: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.checkValidation();
    this.electoralDistrictService.getAll().subscribe((electoralDistricts) => {
      this.electoralDistricts = electoralDistricts;
      this.changeDetect.detectChanges();
    });
  }

  public ngOnChanges(): void {
    this.updateButtonStates();
    this.changeDetect.detectChanges();
  }

  private updateButtonStates(): void {
    switch (this.election.electionType) {
      case this.electionTypes.Majorz:
        this.majorzButton = 'primary';
        this.proporzButton = 'secondary';
        break;
      case this.electionTypes.Proporz:
        this.majorzButton = 'secondary';
        this.proporzButton = 'primary';
        break;
      default:
        this.majorzButton = 'secondary';
        this.proporzButton = 'secondary';
        break;
    }
  }

  public checkValidation(): void {
    this.isValid = !!(
      this.election &&
      this.election.electionType &&
      this.election.name &&
      this.election.submissionDeadlineBegin &&
      this.election.submissionDeadlineEnd &&
      this.election.contestDate &&
      this.election.domainsOfInfluence &&
      this.election.domainsOfInfluence.length === 1 &&
      !(this.majorzButton == 'secondary' && this.proporzButton == 'secondary')
    );

    this.isValidChange.emit(this.isValid);
  }

  public deleteDomainOfInfluence(ev: DomainOfInfluenceModel): void {
    if (this.election.id === '') {
      return;
    }

    this.electionDomainOfInfluenceService.delete(this.election.id, ev.id).subscribe(
      () =>
        this.snackbarService.success(
          this.translateService.instant('ELECTION_DOMAIN_OF_INFLUENCE.MSG_REMOVED')
        ),
      (err) => {
        this.snackbarService.error(
          this.translateService.instant('ELECTION_DOMAIN_OF_INFLUENCE.MSG_REMOVED_FAILED')
        );
        console.error('failed to remove domain of influence', err);
      }
    );
  }

  public addDomainOfInfluence(ev: DomainOfInfluenceModel): void {
    if (this.election.id === '') {
      return;
    }

    const electionDoi: ElectionDomainOfInfluenceModel = {
      numberOfMandates: 1,
      id: ev.id,
      name: '',
    };
    this.electionDomainOfInfluenceService.create(this.election.id, electionDoi).subscribe(
      () =>
        this.snackbarService.success(this.translateService.instant('ELECTION_DOMAIN_OF_INFLUENCE.MSG_ADDED')),
      (err) => {
        this.snackbarService.error(
          this.translateService.instant('ELECTION_DOMAIN_OF_INFLUENCE.MSG_ADDED_FAILED')
        );
        console.error('failed to add domain of influence', err);
      }
    );
  }

  public setTyoeOfElection(event: string): void {
    if (event == this.electionTypes.Majorz) {
      this.majorzButton = 'primary';
      this.proporzButton = 'secondary';
      this.election.electionType = this.electionTypes.Majorz;
    }
    if (event == this.electionTypes.Proporz) {
      this.majorzButton = 'secondary';
      this.proporzButton = 'primary';
      this.election.electionType = this.electionTypes.Proporz;
    }
    this.checkValidation();
  }
}
