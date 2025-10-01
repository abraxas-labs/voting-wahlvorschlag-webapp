/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

export enum DomainOfInfluenceType {
  CH = 'CH',
  CT = 'CT',
  BZ = 'BZ',
  MU = 'MU',
  SC = 'SC',
  KI = 'KI',
  OG = 'OG',
  KO = 'KO',
  SK = 'SK',
  AN = 'AN',
}

export class DomainOfInfluenceModel {
  public tenantId: string = '';
  public officialId: number;
  public name: string = '';
  public shortName: string = '';
  public domainOfInfluenceType: DomainOfInfluenceType = DomainOfInfluenceType.CH;
  public id: string = '';
  public creationDate?: Date;
  public createdBy: string = '';
  public modifiedDate?: Date;
  public modifiedBy: string = '';

  constructor(name: string) {
    this.name = name;
  }
}

export function NewDomainOfInfluence(): DomainOfInfluenceModel {
  return {
    tenantId: '',
    officialId: null,
    name: '',
    shortName: '',
    domainOfInfluenceType: DomainOfInfluenceType.CH,
    id: '',
    createdBy: '',
    modifiedBy: '',
  };
}
