/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { BaseEntityModel } from './base-entity.model';
import { ListUnionModel } from './list-union-model';

export interface ListModel extends BaseEntityModel {
  responsiblePartyTenantId: string;
  indenture?: string;
  submitDate?: Date;
  name: string;
  description?: string;
  sortOrder: number;
  state: ListState;
  representative: string;
  memberUsers: string[];
  deputyUsers: string[];
  locked: boolean;
  validated: boolean;
  version: number;
  listUnion?: ListUnionModel;
  listSubUnion?: ListUnionModel;
  createdByName?: string;
  modifiedByName?: string;
}

export enum ListState {
  Draft = 'Draft',
  Submitted = 'Submitted',
  FormallySubmitted = 'FormallySubmitted',
  Valid = 'Valid',
  Archived = 'Archived',
}

export enum ListExportType {
  Candidates = 'Candidates',
  Signatories = 'Signatories',
  WabstiCandidates = 'WabstiCandidates',
}

export function newListModel(respPartyId: string, currentUserLoginId: string): ListModel {
  return {
    id: '',
    createdBy: currentUserLoginId,
    creationDate: new Date(),
    responsiblePartyTenantId: respPartyId,
    name: '',
    sortOrder: 0,
    state: ListState.Draft,
    representative: currentUserLoginId,
    deputyUsers: [],
    memberUsers: [],
    locked: false,
    validated: false,
    version: 1,
  };
}
