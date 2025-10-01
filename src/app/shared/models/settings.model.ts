/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { BaseEntityModel } from './base-entity.model';

export interface SettingsModel extends BaseEntityModel {
  showBallotPaperInfos: boolean;
  showPartyOnProporzElection: boolean;
  tenantLogo: string;
  wabstiExportTenantTitle: string;
}
