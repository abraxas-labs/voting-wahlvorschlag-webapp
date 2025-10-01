/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { BaseEntityModel } from './base-entity.model';
import { ElectionDomainOfInfluenceModel } from './election-domain-of-influence.model';
import { InfoTextModel } from './info-text.model';
import { DocumentModel } from './document.model';

export interface ElectionOverviewModel extends BaseEntityModel {
  name: string;
  description?: string;
  submissionDeadlineBegin: Date;
  submissionDeadlineEnd: Date;
  submissionDeadlineDiff: number;
  contestDate: Date;
  electionType: ElectionType;
  fileUploadActivated: boolean;
  fileUploadDescription?: string;
  quorumSignaturesCount?: number;
  isArchived: boolean;
}

export interface ElectionModel {
  id: string;
  name: string;
  description?: string;
  submissionDeadlineBegin: Date;
  submissionDeadlineEnd: Date;
  contestDate: Date;
  availableFrom?: Date;
  electionType: ElectionType;
  quorumSignaturesCount?: number;
  domainsOfInfluence: ElectionDomainOfInfluenceModel[];
  documents: DocumentModel[];
  infoTexts: InfoTextModel[];
  tenantLogo?: string;
  isArchived: boolean;
}

export enum ElectionType {
  Proporz = 'Proporz',
  Majorz = 'Majorz',
}

export enum ElectionExportType {
  EmptyCandidates = 'EmptyCandidates',
  EmptyListUnions = 'EmptyListUnions',
  EmptySignatories = 'EmptySignatories',
  Candidates = 'Candidates',
  FederalChancellery = 'FederalChancellery',
  ECH157 = 'ECH157',
}

export function newElectionModel(): ElectionModel {
  return {
    id: '',
    name: '',
    submissionDeadlineBegin: new Date(),
    submissionDeadlineEnd: new Date(),
    contestDate: new Date(),
    availableFrom: new Date(),
    electionType: ElectionType.Majorz,
    documents: [],
    domainsOfInfluence: [],
    infoTexts: [],
    isArchived: false,
  };
}
