/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  AuthenticationService,
  AuthorizationService,
  SnackbarComponent,
  Tenant,
} from '@abraxas/base-components';
import { firstValueFrom, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SnackbarService } from './shared/services/snackbar.service';
import { ThemeService, LanguageService } from '@abraxas/voting-lib';
import { GuardService } from './shared/guard.service';
import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocationStrategy } from '@angular/common';
import moment from 'moment';
import 'moment/locale/de';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly authentication = inject(AuthenticationService);
  private readonly authorization = inject(AuthorizationService);
  private readonly translations = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly snackbarService = inject(SnackbarService);
  private readonly guardService = inject(GuardService);
  private readonly languageService = inject(LanguageService);
  private readonly locationStrategy = inject(LocationStrategy);

  @ViewChild('snackbar') private snackbar!: SnackbarComponent;
  public loggedIn: boolean = false;
  private authSubscription: Subscription | undefined;
  private tenantSubscription: Subscription | undefined;
  private previousTenant?: Tenant;

  public theme?: string;
  public customLogo?: string;
  public isOverview: boolean = false;
  public isArchive: boolean = false;
  public isBaseData: boolean = false;
  public isUserManagement: boolean = false;
  public appTitle: string = '';
  public isWahlverwalter: boolean = false;
  public hasTenant = false;
  public loading = false;

  private readonly subscriptions: Subscription[] = [];

  constructor() {
    const themeService = inject(ThemeService);

    this.authorization.getActiveTenant();
    moment.locale(this.languageService.currentLanguage);
    this.translations.setDefaultLang(this.languageService.currentLanguage);

    const themeSubscription = themeService.theme$.subscribe((theme) => this.onThemeChange(theme));
    this.subscriptions.push(themeSubscription);

    const logoSubscription = themeService.logo$.subscribe((logo) => (this.customLogo = logo));
    this.subscriptions.push(logoSubscription);
  }

  public async ngOnInit(): Promise<void> {
    this.hasTenant = false;
    this.loading = true;

    this.translations.use('de');

    if (!(await this.authentication.authenticate())) {
      this.loading = false;
      return;
    }

    this.loggedIn = true;

    // Preload tenant data to avoid multiple calls to the authorization endpoint by subsequent modules
    try {
      const activeTenant = await this.authorization.getActiveTenant();
      this.previousTenant = activeTenant;
      this.hasTenant = true;
    } catch (e) {
      this.hasTenant = false;
    } finally {
      this.loading = false;
    }

    this.guardService.isWahlverwalter().subscribe((isW) => {
      this.isWahlverwalter = isW;
    });
    if (this.router.url.includes('/-/elections/overview')) {
      this.activateOverview();
    } else if (this.router.url.includes('/-/elections/archive')) {
      this.activateArchive();
    } else if (this.router.url.includes('administration/base-data')) {
      this.activateBaseData();
    } else if (this.router.url.includes('administration/permissions')) {
      this.activateUserManagement();
    }

    this.snackbarService.getSnackbarMessages$.subscribe((snackbarMessage) => {
      if (this.snackbar && snackbarMessage.message) {
        this.snackbar.message = this.translations.instant(snackbarMessage.message);
        this.snackbar.variant = snackbarMessage.variant;
        this.snackbar.open();
      }
    });

    this.tenantSubscription = this.authorization.activeTenantChanged.subscribe((tenant) => {
      if (this.previousTenant && this.previousTenant.id !== tenant.id) {
        window.location.reload();
      }
      this.previousTenant = tenant;
    });
  }

  public activateOverview(): void {
    this.isOverview = true;
    this.isArchive = false;
    this.isBaseData = false;
    this.isUserManagement = false;
  }

  public activateArchive(): void {
    this.isOverview = false;
    this.isArchive = true;
    this.isBaseData = false;
    this.isUserManagement = false;
  }

  public activateBaseData(): void {
    this.isOverview = false;
    this.isArchive = false;
    this.isBaseData = true;
    this.isUserManagement = false;
  }

  public activateUserManagement(): void {
    this.isOverview = false;
    this.isArchive = false;
    this.isBaseData = false;
    this.isUserManagement = true;
  }

  public async reload(): Promise<void> {
    // reload to ensure consistent state across all components, needed due to some base-components
    window.location.href = this.locationStrategy.getBaseHref();
  }

  public logout(): void {
    this.authentication.logout();
  }

  public ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.tenantSubscription) {
      this.tenantSubscription.unsubscribe();
    }
  }

  private async onThemeChange(theme?: string): Promise<void> {
    if (!theme) {
      return;
    }
    this.appTitle = await firstValueFrom(this.translations.get('APPLICATION.' + theme));
    this.theme = theme;
  }
}
