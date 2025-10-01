/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { RxJsUtilsService } from './rx-js-utils.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  private filenameRegex: RegExp = /filename\*=UTF-8''?([^;]*)/;

  constructor(
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private rx: RxJsUtilsService,
    private snackbar: SnackbarService
  ) {}

  public download(url: string): Observable<void> {
    return this.httpClient
      .get(url, {
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        this.rx.toastDefault(),
        map((resp) => {
          const fname = this.getFilename(resp.headers.get('content-disposition'));
          saveAs(resp.body, fname);
          this.snackbar.success(this.translateService.instant('DOWNLOAD_SUCCESSFUL', { filename: fname }));
        })
      );
  }

  public downloadFromBase64(filename: string, data: string): void {
    const byteString = atob(data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    saveAs(new Blob([ab]), filename);
  }

  private getFilename(contentDisp: string): string | undefined {
    if (!contentDisp || contentDisp.indexOf('attachment') === -1) {
      return undefined;
    }

    const matches = this.filenameRegex.exec(contentDisp);
    return matches != null && matches[1] ? decodeURIComponent(matches[1]) : undefined;
  }
}
