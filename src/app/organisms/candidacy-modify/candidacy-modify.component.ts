/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Sex } from 'src/app/shared/models/candidate.model';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { InfoTextService } from 'src/app/shared/services/info-text.service';
import { ListCandidateModel, newListCandidateModel } from 'src/app/shared/models/ListCandidate.model';
import { GuardService } from 'src/app/shared/guard.service';
import { RxJsUtilsService } from '../../shared/services/rx-js-utils.service';
import { SettingsModel } from '../../shared/models/settings.model';
import { ElectionModel, ElectionType } from '../../shared/models/election.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface SexDropdownItem {
  displayValue: string;
  value: Sex;
}

@Component({
  selector: 'app-candidacy-modify',
  templateUrl: './candidacy-modify.component.html',
  styleUrls: ['./candidacy-modify.component.scss'],
  standalone: false,
})
export class CandidacyModifyComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() public formSubmit: EventEmitter<{
    candidacy: ListCandidateModel;
    nextRequested: boolean;
  }> = new EventEmitter();

  public election: ElectionModel;
  public settings: SettingsModel;
  @ViewChild('candidacyForm') public form: NgForm;

  private formStatusSubscription: Subscription | undefined;
  public isWahlverwalter: boolean = false;
  public sex: typeof Sex = Sex;
  public moreVisible: boolean = false;
  public isValid: boolean = false;
  public infoTexts: Map<string, string> = new Map();
  public sexDropdownItems: SexDropdownItem[] = [];
  private _candidacy: ListCandidateModel = newListCandidateModel();
  public candidacy: ListCandidateModel;
  public candidateCount: number;
  public maxCandidateCount: number;
  public isNewCandidate: boolean;

  constructor(
    private translateService: TranslateService,
    private infoTextService: InfoTextService,
    private guardService: GuardService,
    private rxUtils: RxJsUtilsService,
    private ref: ChangeDetectorRef,
    private readonly dialogRef: MatDialogRef<CandidacyModifyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.candidacy = data.data.candidacy;
    this.Candidacy = data.data.candidacy;
    this.election = data.data.election;
    this.settings = data.data.settings;
    this.candidateCount = data.data.candidateCount;
    this.maxCandidateCount = data.data.maxCandidateCount;
    this.isNewCandidate = !this.candidacy.id;
    if (this.isNewCandidate) {
      this.candidateCount++;
    }
  }

  public get Candidacy(): ListCandidateModel {
    return this._candidacy;
  }

  public set Candidacy(value: ListCandidateModel) {
    this.moreVisible = true;
    this._candidacy = {
      ...value,
    };
    if (!this.form) {
      return;
    }
  }

  public ngOnInit(): void {
    const male = this.translateService.instant('SEX.Male');
    const female = this.translateService.instant('SEX.Female');

    this.sexDropdownItems = [
      { value: Sex.Male, displayValue: male },
      { value: Sex.Female, displayValue: female },
    ];

    this.guardService.isWahlverwalter().subscribe((isW) => (this.isWahlverwalter = isW));

    this.infoTextService
      .getAll(this.election.id)
      .pipe(this.rxUtils.toastDefault())
      .subscribe((texts) => {
        this.infoTexts = new Map();
        texts.map((t) => {
          if (!t.visible) {
            return;
          }
          this.infoTexts.set(t.key, t.value);
        });
      });
  }

  public ngAfterViewInit(): void {
    this.isValid = this.form.valid;
    this.formStatusSubscription = this.form.statusChanges.subscribe((result: string) => {
      const isValid = result === 'VALID';
      if (this.isValid === isValid) {
        return;
      }
      this.isValid = isValid;
    });

    //This triggers the initial required state for the dateOfBirth field.
    //it does not appear red initially because of a base-components problem.
    if (!this.candidacy.dateOfBirth) {
      this.candidacy.dateOfBirth = ' ';
    }
    this.ref.detectChanges();
  }

  public ngOnDestroy(): void {
    if (this.formStatusSubscription) {
      this.formStatusSubscription.unsubscribe();
    }
  }

  public hasAnyInputLeadingOrTrallingWhiteSpaces(input: string): boolean {
    return !!input && input.trim() !== input;
  }

  public showErrorMessageForLeadingOrTrailingWhitespaces(input: string): string {
    return this.hasAnyInputLeadingOrTrallingWhiteSpaces(input)
      ? this.translateService.instant('CANDIDACY.NO_TRAILING_SPACES_ALLOWED')
      : '';
  }

  public disableButtonWhenFieldsHaveTrailingOrLeadingSpaces(controlName: string): void {
    const control = this.form.controls[controlName];
    if (control.value && control.value.trim() !== control.value) {
      control.setErrors({ incorrect: true });
    } else {
      control.setErrors({ incorrect: false });
      control.updateValueAndValidity();
    }
  }

  public get isMajorz(): boolean {
    return this.election && this.election.electionType === ElectionType.Majorz;
  }

  public isTagged(field: string): boolean {
    return this.Candidacy.markings.findIndex((f) => f.field === field) !== -1;
  }

  public setTag(field: string, tagged: boolean): void {
    const index = this.Candidacy.markings.findIndex((f) => f.field === field);
    if (!tagged && index !== -1) {
      this.candidacy.markings.splice(index, 1);
    } else if (tagged && index === -1) {
      this.candidacy.markings.push({ field });
    }
  }

  public apply(requestNext: boolean = false): void {
    this.formSubmit.emit({
      candidacy: this.candidacy,
      nextRequested: requestNext,
    });
    this.candidateCount++;
    if (!requestNext) {
      this.close();
    } else {
      this.candidacy = newListCandidateModel();
      this.isNewCandidate = true;
      //This triggers the initial required state for the dateOfBirth field.
      //it does not appear red initially because of a base-components problem.
      this.candidacy.dateOfBirth = ' ';
      this.ref.detectChanges();
    }
  }

  public close(): void {
    this.dialogRef.close();
  }
}
