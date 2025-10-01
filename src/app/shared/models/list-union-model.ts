/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { IdModel } from './id.model';

export interface ListUnionModel {
  rootListId?: string;
  isSubUnion: boolean;
  lists: IdModel[];
}
