/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { IdModel } from './id.model';

export interface BaseEntityModel extends IdModel {
  createdBy?: string;
  creationDate?: Date;
  modifiedBy?: string;
  modifiedDate?: Date;
}
