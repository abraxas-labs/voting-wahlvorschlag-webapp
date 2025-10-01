/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PartyModel } from './party.model';

export class PartyUserModel {
  public id: string;
  public loginid: string;
  public firstname: string;
  public lastname: string;
  public username: string;
  public email: string | undefined;
  public tenants: PartyModel[];
  public tenantDescription: string;
}

export function newUser(): PartyUserModel {
  return {
    id: '',
    loginid: '',
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    tenants: [],
    tenantDescription: '',
  };
}
