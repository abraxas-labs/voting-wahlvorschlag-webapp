/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { CountryModel } from '../models/country.model';

@Pipe({
  name: 'countryIsoToDescription',
  standalone: false,
})
export class CountryIsoToDescriptionPipe implements PipeTransform {
  public transform(value: string, countries: CountryModel[]): string {
    const country = countries.find((c) => c.isoId === value);
    return country?.description ?? value;
  }
}
