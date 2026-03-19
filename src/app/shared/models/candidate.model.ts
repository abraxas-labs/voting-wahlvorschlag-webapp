/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { BaseEntityModel } from './base-entity.model';
import { MarkingModel } from './marking.model';
import { DocumentModel } from './document.model';

export enum Sex {
  Male = 'Male',
  Female = 'Female',
  Undefined = 'Undefined',
}

export interface CandidateModel extends BaseEntityModel {
  familyName: string;
  firstName: string;
  dateOfBirth?: any;
  title?: string;
  occupationalTitle: string;
  origin: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  locality: string;
  sex: Sex;
  ballotFamilyName: string;
  ballotFirstName: string;
  ballotOccupationalTitle: string;
  ballotLocality: string;
  incumbent: boolean;
  countryId?: string;
  listId?: string;
  cloned: boolean;
  index: number; // 1-based candidate number
  orderIndex: number; // 1-based position in the list
  cloneOrderIndex?: number; // 1-based position of the clone in the list
  party?: string;
  markings?: MarkingModel[];
}

export function newCandidateModel(orderIndex: number): CandidateModel {
  return {
    id: '',
    createdBy: '',
    creationDate: new Date(),
    familyName: '',
    firstName: '',
    dateOfBirth: null,
    sex: Sex.Male,
    occupationalTitle: '',
    origin: '',
    street: '',
    cloned: false,
    houseNumber: '',
    zipCode: '',
    locality: '',
    ballotFamilyName: '',
    ballotFirstName: '',
    ballotOccupationalTitle: '',
    ballotLocality: '',
    incumbent: false,
    markings: [],
    index: orderIndex,
    orderIndex: orderIndex,
  };
}
