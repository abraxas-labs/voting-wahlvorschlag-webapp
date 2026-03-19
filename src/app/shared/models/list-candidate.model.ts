/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { CandidateModel } from './candidate.model';

export interface ListCandidateModel {
  candidate: CandidateModel;
  index: number;
  isCloned: boolean; // flag whether this entry is the cloned candidate. false for the non-cloned entry.
}
