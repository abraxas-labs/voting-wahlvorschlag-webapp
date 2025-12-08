/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { InfoTextModel } from 'src/app/shared/models/info-text.model';
import { InfoTextService } from 'src/app/shared/services/info-text.service';
import { finalize } from 'rxjs/operators';
import { SettingsModel } from '../../shared/models/settings.model';
import { RxJsUtilsService } from '../../shared/services/rx-js-utils.service';
import { SettingsService } from '../../shared/services/settings.service';
import { forkJoin } from 'rxjs';
import { ElectionType } from '../../shared/models/election.model';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

interface InfoTextItem {
  key: string;
  translationToken: string;
  text: string;
  visible: boolean;
  electionType?: ElectionType;
}

@Component({
  selector: 'app-candidacy',
  templateUrl: './candidacy.component.html',
  styleUrls: ['./candidacy.component.scss'],
  standalone: false,
})
export class CandidacyComponent implements OnInit {
  private infoTextService = inject(InfoTextService);
  private snackbarService = inject(SnackbarService);
  private rxUtils = inject(RxJsUtilsService);
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);

  public loadingCount: number = 0;
  public saving: boolean = false;
  @Input() public basedata: boolean = true;
  @Input() public infoTexts?: InfoTextModel[];
  @Input() public electionType?: ElectionType;
  @Output() public infoTextsChange: EventEmitter<Partial<InfoTextModel>[]> = new EventEmitter<
    Partial<InfoTextModel>[]
  >();

  public settings: SettingsModel = null;
  private items: InfoTextItem[] = [
    {
      key: 'firstName',
      translationToken: 'CANDIDACY.FIRSTNAME',
      text: '',
      visible: true,
    },
    {
      key: 'familyName',
      translationToken: 'CANDIDACY.FAMILYNAME',
      text: '',
      visible: true,
    },
    {
      key: 'ballotFirstName',
      translationToken: 'CANDIDACY.BALLOT_FIRSTNAME',
      text: '',
      visible: true,
    },
    {
      key: 'ballotFamilyName',
      translationToken: 'CANDIDACY.BALLOT_NAME',
      text: '',
      visible: true,
    },
    {
      key: 'dateOfBirth',
      translationToken: 'CANDIDACY.DATEOFBIRTH',
      text: '',
      visible: true,
    },
    {
      key: 'sex',
      translationToken: 'CANDIDACY.SEX',
      text: '',
      visible: true,
    },
    {
      key: 'title',
      translationToken: 'CANDIDACY.TITLE',
      text: '',
      visible: true,
    },
    {
      key: 'occupationalTitle',
      translationToken: 'CANDIDACY.OCCUPATION',
      text: '',
      visible: true,
    },
    {
      key: 'origin',
      translationToken: 'CANDIDACY.ORIGIN',
      text: '',
      visible: true,
    },
    {
      key: 'street',
      translationToken: 'CANDIDACY.STREET',
      text: '',
      visible: true,
    },
    {
      key: 'houseNumber',
      translationToken: 'CANDIDACY.HOUSE_NUMBER',
      text: '',
      visible: true,
    },
    {
      key: 'swissZipCode',
      translationToken: 'CANDIDACY.ZIP',
      text: '',
      visible: true,
    },
    {
      key: 'locality',
      translationToken: 'CANDIDACY.LOCALITY',
      text: '',
      visible: true,
    },
    {
      key: 'party',
      translationToken: 'CANDIDACY.PARTY',
      text: '',
      visible: true,
      electionType: ElectionType.Majorz,
    },
    {
      key: 'incumbent',
      translationToken: 'CANDIDACY.INCUMBENT',
      text: '',
      visible: true,
    },
    {
      key: 'ballotOccupationalTitle',
      translationToken: 'CANDIDACY.BALLOT_OCCUPATION_TITLE',
      text: '',
      visible: true,
    },
    {
      key: 'ballotLocality',
      translationToken: 'CANDIDACY.BALLOT_LOCALITY',
      text: '',
      visible: true,
    },
  ];

  private ballotPaperInfoKeys: string[] = ['ballotOccupationalTitle', 'ballotLocality'];

  public get standardInfoTexts(): InfoTextItem[] {
    return this.items.filter((i) => this.ballotPaperInfoKeys.indexOf(i.key) === -1);
  }

  public get ballotPaperInfoTexts(): InfoTextItem[] {
    return this.items.filter((i) => this.ballotPaperInfoKeys.indexOf(i.key) > -1);
  }

  public ngOnInit(): void {
    this.loadingCount = 2;
    this.infoTextService
      .getAll()
      .pipe(
        this.rxUtils.toastDefault(),
        finalize(() => this.loadingCount--)
      )
      .subscribe((texts) => {
        texts = texts.filter((i) => i.electionId === null);
        this.items = this.reconcile(texts);
        if (!this.basedata) {
          this.items = this.reconcile(this.infoTexts || []);
        }
      });

    this.settingsService
      .get()
      .pipe(
        this.rxUtils.toastDefault(),
        finalize(() => this.loadingCount--)
      )
      .subscribe((settings) => (this.settings = settings));
  }

  public saveChanges(): void {
    this.saving = true;

    const saveInfoTexts = this.infoTextService.setMany(
      this.items.map((item) => ({
        key: item.key,
        value: item.text,
        visible: item.visible,
      }))
    );
    const saveSettings = this.settingsService.update({
      showBallotPaperInfos: this.settings.showBallotPaperInfos,
      showPartyOnProporzElection: this.settings.showPartyOnProporzElection,
    });

    forkJoin(saveInfoTexts, saveSettings)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.snackbarService.success(this.translateService.instant('CANDIDACY.MSG_INFO_SUCCESS'));
        },
        error: () => {
          this.snackbarService.error(this.translateService.instant('CANDIDACY.MSG_INFO_ERROR'));
        },
      });
  }

  public updateInfoTexts(): void {
    this.infoTextsChange.emit(
      this.mergeInfotexts(
        this.infoTexts || [],
        this.items.map((item) => ({
          key: item.key,
          value: item.text,
          visible: item.visible,
        }))
      )
    );
  }

  private reconcile(texts: InfoTextModel[]): InfoTextItem[] {
    return this.items.map((i) => {
      const text = texts.find((t) => t.key === i.key);
      if (text) {
        return {
          ...i,
          text: text.value,
          visible: text.visible,
        };
      }
      return i;
    });
  }

  private mergeInfotexts(
    texts: Partial<InfoTextModel>[],
    newTexts: Partial<InfoTextModel>[]
  ): Partial<InfoTextModel>[] {
    const merged = [...texts];
    newTexts.forEach((newText) => {
      const index = merged.findIndex((i) => i.key === newText.key);
      if (index > -1) {
        merged[index] = newText;
        return;
      }
      merged.push(newText);
    });
    return merged;
  }
}
