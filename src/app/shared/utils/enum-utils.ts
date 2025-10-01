/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

export function EnumValues<T>(enumClass: any): T[] {
  const values: T[] = [];
  for (const value in enumClass) {
    if (enumClass.hasOwnProperty(value)) {
      values.push(enumClass[value]);
    }
  }
  return values;
}
