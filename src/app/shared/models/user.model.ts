/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  Label,
  Lifecycle,
  PasswordState,
  ProfileEmail,
  ProfilePhonenumber,
  User,
} from '@abraxas/base-components';

export class UserModel implements User {
  public servicename?: string;
  public passwordState: PasswordState;
  public resource_owner_tenant_id: string;
  public emails: ProfileEmail[];
  public externalIdps: string[];
  public firstname: string;
  public generation: string;
  public id: string;
  public labels: Label[];
  public lastname: string;
  public lifecycle: Lifecycle;
  public loginid: string;
  public phonenumbers: ProfilePhonenumber[];
  public type: string;
  public username: string;

  public get fullName(): string {
    return `${this.firstname} ${this.lastname}`;
  }
}
