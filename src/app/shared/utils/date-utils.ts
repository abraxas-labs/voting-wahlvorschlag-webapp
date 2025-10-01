/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateUtils {
  /**
   * Converts a local date to a correct UTC string (by correctly ignoring the time part)
   */
  public static dateToUtcString(date: Date): any {
    const fixedLocaleDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return fixedLocaleDate.toISOString();
  }

  /**
   * Converts a UTC date string to a correct local time (by correctly ignoring the time part)
   */
  public static dateFromUtcString(utcString: any): Date {
    const wrongLocalTime = new Date(utcString);
    return new Date(
      wrongLocalTime.getUTCFullYear(),
      wrongLocalTime.getUTCMonth(),
      wrongLocalTime.getUTCDate()
    );
  }
}
