/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

export class PartyModel {
  public id: string | undefined;
  public tenantId: string | undefined;
  public name: string | undefined;
}

export function newParty(): PartyModel {
  return {
    id: '',
    tenantId: '',
    name: '',
  };
}
