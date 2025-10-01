/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IsAuthenticatedGuard } from '@abraxas/base-components';
import { ElectionOverviewComponent } from './pages/election-overview/election-overview.component';
import { BaseDataComponent } from './pages/base-data/base-data.component';
import { ListModifyComponent } from './pages/list-modify/list-modify.component';
import { ListOverviewComponent } from './pages/list-overview/list-overview.component';
import { ElectionArchiveComponent } from './pages/election-archiv/election-archive.component';
import { WahlverwalterGuard } from './shared/wahlverwalter.guard';
import { ElectionModifyComponent } from './pages/election-modify/election-modify.component';
import { CandidaciesComponent } from './pages/candidacies/candidacies.component';
import { CanDeactivateGuard } from './shared/can-deactivate.guard';
import { UserAdministrationComponent } from './pages/user-administration/user-administration.component';
import { AwaitTenantGuard } from './shared/await-tenant.guard';
import { PartyModifyComponent } from './pages/user-administration/party-modify/party-modify.component';
import { UserModifyComponent } from './pages/user-administration/user-modify/user-modify.component';
import { ModifyDomainsOfInfluenceComponent } from './organisms/domains-of-influence/new-domains-of-influence/modify-domains-of-influence.component';
import { AuthThemeGuard, ThemeService } from '@abraxas/voting-lib';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ThemeService.NoTheme,
  },
  {
    path: ':theme',
    canActivate: [AuthThemeGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'elections/overview',
      },
      {
        path: 'elections',
        canActivate: [IsAuthenticatedGuard],
        children: [
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full',
          },
          {
            path: 'overview',
            component: ElectionOverviewComponent,
          },
          {
            path: 'modify',
            component: ElectionModifyComponent,
          },
          {
            path: 'archive',
            component: ElectionArchiveComponent,
          },
          {
            path: ':electionId',
            children: [
              {
                path: '',
                component: ListOverviewComponent,
              },
              {
                path: 'modify',
                component: ElectionModifyComponent,
              },
              {
                path: 'lists/new',
                component: ListModifyComponent,
              },
              {
                path: 'lists/:listId',
                children: [
                  {
                    path: '',
                    pathMatch: 'full',
                    canDeactivate: [CanDeactivateGuard],
                    component: CandidaciesComponent,
                  },
                  {
                    path: 'modify',
                    component: ListModifyComponent,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'administration',
        canActivate: [IsAuthenticatedGuard, WahlverwalterGuard, AwaitTenantGuard],
        children: [
          {
            path: 'base-data',
            canActivate: [IsAuthenticatedGuard, WahlverwalterGuard, AwaitTenantGuard],
            children: [
              {
                path: '',
                component: BaseDataComponent,
              },
              {
                path: 'modify',
                component: ModifyDomainsOfInfluenceComponent,
              },
              {
                path: 'modify/:doiId',
                component: ModifyDomainsOfInfluenceComponent,
              },
            ],
          },
          {
            path: 'permissions',
            component: UserAdministrationComponent,
          },
          {
            path: 'parties',
            children: [
              {
                path: 'new',
                component: PartyModifyComponent,
              },
            ],
          },
          {
            path: 'users',
            children: [
              {
                path: 'new',
                component: UserModifyComponent,
              },
              {
                path: ':userId',
                component: UserModifyComponent,
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [WahlverwalterGuard],
})
export class AppRoutingModule {}
