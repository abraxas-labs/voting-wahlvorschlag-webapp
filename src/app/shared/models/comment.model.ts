/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { BaseEntityModel } from './base-entity.model';

export interface CommentModel extends BaseEntityModel {
  content: string;
  creatorFirstName: string;
  creatorLastName: string;
}
