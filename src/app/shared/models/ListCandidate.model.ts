/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { v4 as uuid } from 'uuid';
import { CandidateModel, newCandidateModel } from './candidate.model';

export interface ListCandidateModel extends CandidateModel {
  uuid: string;
  originalUuid: string;
  cloneUuid?: string;
}

export function newListCandidateModel(): ListCandidateModel {
  const id = uuid();

  return {
    ...newCandidateModel(),
    uuid: id,
    originalUuid: id,
  };
}
