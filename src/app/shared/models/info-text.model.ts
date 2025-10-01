/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

export enum InfoTextKeys {
  TENANT_TITLE = 'tenantTitle',
  WABSTI_TENANT_TITLE = 'wabstiTenantTitle',
  FORM_CANDIDACIES = 'formCandidacies',
  FORM_SIGNATORIES = 'formSignatories',
  FORM_LISTUNION = 'formListunion',
}

export interface InfoTextModel {
  electionId?: string;
  tenantId?: string;
  key: string;
  value: string;
  visible: boolean;
  language?: string;
  id?: string;
  creationDate?: Date;
  createdBy?: string;
  modifiedDate?: Date;
  modifiedBy?: string;
}
