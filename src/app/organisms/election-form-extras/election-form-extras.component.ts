/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InfoTextKeys, InfoTextModel } from 'src/app/shared/models/info-text.model';
import { ElectionType } from '../../shared/models/election.model';

@Component({
  selector: 'app-election-form-extras',
  templateUrl: './election-form-extras.component.html',
  styleUrls: ['./election-form-extras.component.scss'],
  standalone: false,
})
export class ElectionFormExtrasComponent implements OnInit {
  @Input() public quorumSignaturesCount: number = 0;
  @Output() public quorumSignaturesCountChange: EventEmitter<number> = new EventEmitter<number>();
  @Input() public infoTexts: InfoTextModel[] = [];
  @Output() public infoTextsChange: EventEmitter<InfoTextModel[]> = new EventEmitter<InfoTextModel[]>();
  @Input() public tenantLogo: string = '';
  @Input() public electionType: ElectionType;
  @Input() public readonly: boolean = false;
  @Output() public tenantLogoChange: EventEmitter<string> = new EventEmitter<string>();

  public infotextCandidacies: string | null = null;
  public infotextSignatories: string | null = null;
  public infotextListUnion: string | null = null;

  public infotextTenantTitle: InfoTextModel | null = null;

  public ngOnInit(): void {
    this.infoTexts.forEach((text) => {
      switch (text.key) {
        case InfoTextKeys.TENANT_TITLE:
          this.infotextTenantTitle = text;
          break;
        case InfoTextKeys.FORM_CANDIDACIES:
          this.infotextCandidacies = text.value;
          break;
        case InfoTextKeys.FORM_SIGNATORIES:
          this.infotextSignatories = text.value;
          break;
        case InfoTextKeys.FORM_LISTUNION:
          this.infotextListUnion = text.value;
          break;
      }
    });

    // special case if the tenant-title doesn't exist in the base infotexts. add a dummy
    if (!this.infotextTenantTitle) {
      this.infotextTenantTitle = { key: InfoTextKeys.TENANT_TITLE, value: '', visible: false };
    }
  }

  public get isMajorz(): boolean {
    return this.electionType === ElectionType.Majorz;
  }

  public parseInt(num: string): number {
    return parseInt(num, 10);
  }

  public updateInfoTexts(): void {
    if (this.infotextTenantTitle != null) {
      this.updateOrPush(this.infotextTenantTitle);
    }
    if (this.infotextCandidacies !== null) {
      this.updateOrPush({
        key: InfoTextKeys.FORM_CANDIDACIES,
        value: this.infotextCandidacies,
        visible: true,
      } as any);
    }
    if (this.infotextSignatories !== null) {
      this.updateOrPush({
        key: InfoTextKeys.FORM_SIGNATORIES,
        value: this.infotextSignatories,
        visible: true,
      } as any);
    }
    if (this.infotextListUnion !== null) {
      this.updateOrPush({
        key: InfoTextKeys.FORM_LISTUNION,
        value: this.infotextListUnion,
        visible: true,
      } as any);
    }
    this.infoTextsChange.emit(this.infoTexts);
  }

  private updateOrPush(text: InfoTextModel): void {
    const index = this.infoTexts.findIndex((i) => i.key === text.key);
    if (index > -1) {
      this.infoTexts[index] = text;
      return;
    }
    this.infoTexts.push(text);
  }
}
