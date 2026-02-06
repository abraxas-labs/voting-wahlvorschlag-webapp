/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentModel } from '../../shared/models/document.model';
import { InfoTextModel } from '../../shared/models/info-text.model';

@Component({
  selector: 'app-tenant-settings-export',
  templateUrl: './tenant-settings-export.component.html',
  styleUrls: ['./tenant-settings-export.component.scss'],
  standalone: false,
})
export class TenantSettingsExportComponent {
  @Input()
  public tenantLogo: string = '';

  @Output()
  public tenantLogoChange: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  public infotextTenantTitle: InfoTextModel;

  @Output()
  public infotextTenantTitleChange: EventEmitter<InfoTextModel> = new EventEmitter<InfoTextModel>();

  @Input()
  public wabstiExportTenantTitle: string;

  @Output()
  public wabstiExportTenantTitleChange: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  public hideWabstiExportTenantTitle: boolean;

  @Input()
  public readonly : boolean = false;

  public setTenantLogo(doc: DocumentModel): void {
    this.tenantLogoChange.emit(doc.document);
  }

  public set tenantIdentifierType(type: string) {
    this.infotextTenantTitle.visible = type === 'text';
    this.updateInfotexts();
  }

  public get tenantIdentifierType(): string {
    return this.infotextTenantTitle && !this.infotextTenantTitle.visible ? 'logo' : 'text';
  }

  public updateInfotexts(): void {
    this.infotextTenantTitleChange.emit(this.infotextTenantTitle);
  }
}
