/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export class SnackbarMessage {
  constructor(
    public readonly message = '',
    public readonly variant: 'basic' | 'error' | 'info' | 'primary' | 'success' | 'warning' = 'basic'
  ) {}
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private snackbarSubject = new BehaviorSubject<SnackbarMessage>(new SnackbarMessage());
  public getSnackbarMessages$ = this.snackbarSubject.asObservable();

  public basic(message: string): void {
    this.snackbarSubject.next(new SnackbarMessage(message, 'basic'));
  }

  public error(message: string): void {
    this.snackbarSubject.next(new SnackbarMessage(message, 'error'));
  }

  public info(message: string): void {
    this.snackbarSubject.next(new SnackbarMessage(message, 'info'));
  }

  public primary(message: string): void {
    this.snackbarSubject.next(new SnackbarMessage(message, 'primary'));
  }

  public success(message: string): void {
    this.snackbarSubject.next(new SnackbarMessage(message, 'success'));
  }

  public warning(message: string): void {
    this.snackbarSubject.next(new SnackbarMessage(message, 'warning'));
  }
}
