/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { BaseEntityModel } from './base-entity.model';

export interface MarkingModel extends BaseEntityModel {
  field: string;
  candidateId?: string;
}
