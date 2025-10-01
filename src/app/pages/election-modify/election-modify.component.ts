/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectionModel, newElectionModel } from '../../shared/models/election.model';
import { ElectionService } from '../../shared/services/election.service';
import { ElectionDomainOfInfluenceModel } from '../../shared/models/election-domain-of-influence.model';
import { forkJoin, Observable } from 'rxjs';
import { ElectionDomainOfInfluenceService } from '../../shared/services/election-domain-of-influence.service';
import { InfoTextService } from '../../shared/services/info-text.service';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { RxJsUtilsService } from '../../shared/services/rx-js-utils.service';
import { SettingsService } from '../../shared/services/settings.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { InfoTextModel } from 'src/app/shared/models/info-text.model';

@Component({
  selector: 'app-election-modify',
  templateUrl: './election-modify.component.html',
  styleUrls: ['./election-modify.component.scss'],
  providers: [ElectionService],
  standalone: false,
})
export class ElectionModifyComponent implements OnInit {
  public activeStep: number = 1;
  public maxStep: number = 4;
  public electionId: number | undefined;
  public election: ElectionModel;
  public validSteps: boolean[] = [false, false, true, true];

  public steps: string[] = ['GENERAL_SETTINGS', 'NUMBER_OF_SEATS', 'ATTACHMENTS', 'INFO_TEXTS'];

  public get isNew(): boolean {
    return this.electionId === undefined;
  }

  public get isActiveStepValid(): boolean {
    return this.validSteps[this.activeStep - 1];
  }

  public loading: boolean = false;
  public savingElection: boolean = false;

  public areInfoTextsDirty: boolean = false;
  private dirtyCheck: string = '';
  private dirtyDomainOfInfluences: string[] = [];

  public newInfoTexts: InfoTextModel[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private electionService: ElectionService,
    private snackbarService: SnackbarService,
    private electionDoiService: ElectionDomainOfInfluenceService,
    private infoTextService: InfoTextService,
    private settingsService: SettingsService,
    private rxUtils: RxJsUtilsService,
    private location: Location,
    private translateService: TranslateService
  ) {
    this.election = newElectionModel();
    this.updateDirtyCheck();
  }

  public ngOnInit(): void {
    this.electionId = this.activatedRoute.snapshot.params.electionId;
    if (this.isNew) {
      // copy all "standard" info texts/settings into this election
      this.loading = true;

      const infoText$ = this.infoTextService.getAll();
      const settings$ = this.settingsService.get();

      forkJoin(infoText$, settings$)
        .pipe(
          this.rxUtils.toastDefault(),
          finalize(() => (this.loading = false))
        )
        .subscribe(
          ([txts, settings]) => {
            this.election.infoTexts = txts;
            this.election.tenantLogo = settings.tenantLogo;
          },
          () => this.location.back()
        );

      return;
    }

    this.loading = true;
    this.electionService
      .get(String(this.electionId))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (el) => {
          this.election = el;
          this.updateDirtyCheck();
        },
        (err) => {
          this.snackbarService.error(this.translateService.instant('ELECTION_LOAD_FAILED'));
          console.error('error', err);
        }
      );
  }

  public nextStep(): void {
    this.activeStep = Math.min(this.maxStep, this.activeStep + 1);
  }

  public infoTextsChanged(infoTexts: Partial<InfoTextModel>[]) {
    this.areInfoTextsDirty = true;
    this.newInfoTexts = infoTexts as InfoTextModel[];
  }

  public createElection(): void {
    this.savingElection = true;
    this.election.infoTexts = this.newInfoTexts;
    this.electionService
      .create(this.election)
      .pipe(finalize(() => (this.savingElection = false)))
      .subscribe(
        () => {
          this.snackbarService.success(this.translateService.instant('ELECTION_CREATED'));
          this.router.navigate(['-', 'elections', 'overview']);
        },
        (error) => {
          this.snackbarService.error(this.translateService.instant('ELECTION_CREATE_ERROR'));
          console.error('error', error);
        }
      );
  }

  public save(): void {
    if (!this.isDirty()) {
      this.snackbarService.info(this.translateService.instant('ELECTION_NO_CHANGES'));
      return;
    }
    const saveObservable: Observable<any>[] = [];
    if (this.isElectionDirty()) {
      // remove documents, since they could be big and are ignored by the API
      const clone = this.clone(this.election);
      clone.documents = null;
      saveObservable.push(this.electionService.update(clone));
    }

    for (const doi of this.election.domainsOfInfluence) {
      if (this.dirtyDomainOfInfluences.indexOf(doi.id) > -1) {
        saveObservable.push(this.electionDoiService.update(String(this.electionId), doi.id, doi));
      }
    }
    if (this.areInfoTextsDirty) {
      this.election.infoTexts = this.newInfoTexts;
      for (const infoText of this.election.infoTexts) {
        infoText.electionId = this.election.id;
      }
      saveObservable.push(this.infoTextService.setMany(this.election.infoTexts));
    }

    this.savingElection = true;
    forkJoin(saveObservable)
      .pipe(finalize(() => (this.savingElection = false)))
      .subscribe(
        () => {
          this.snackbarService.success(this.translateService.instant('SAVED'));
          this.updateDirtyCheck();
        },
        (err) => {
          this.snackbarService.error(this.translateService.instant('SAVE_FAILED'));
          console.error('error', err);
        }
      );
  }

  public previousStep(): void {
    if (this.activeStep === 1) {
      this.router.navigate(['-', 'elections', 'overview']);
      return;
    }
    this.activeStep--;
  }

  public numberOfSeatsChanged(doi: ElectionDomainOfInfluenceModel): void {
    this.dirtyDomainOfInfluences.push(doi.id);
  }

  private isDirty(): boolean {
    return this.isElectionDirty() || this.areDomainOfInfluencesDirty() || this.areInfoTextsDirty;
  }

  private isElectionDirty(): boolean {
    return this.createStringifiedElection() !== this.dirtyCheck;
  }

  private areDomainOfInfluencesDirty(): boolean {
    return this.dirtyDomainOfInfluences.length > 0;
  }

  private updateDirtyCheck(): void {
    this.dirtyCheck = this.createStringifiedElection();
    this.dirtyDomainOfInfluences = [];
    this.areInfoTextsDirty = false;
  }

  private createStringifiedElection(): string {
    const clone = this.clone(this.election);
    clone.infoTexts = null;
    clone.documents = null;
    clone.domainsOfInfluence = null;
    return JSON.stringify(clone);
  }

  private clone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }
}
