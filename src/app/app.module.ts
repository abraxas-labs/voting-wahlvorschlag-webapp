/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  ButtonModule,
  CheckboxModule,
  FileInputModule,
  FormfieldModule,
  IconModule,
  RadioButtonModule,
  SpinnerModule,
  TextareaModule,
  DropdownModule,
  ApplicationModule,
  AuthorizationModule,
  AuthenticationModule,
  UserModule,
  AuthStorageService,
  NavLayoutModule,
  NavigationModule,
  TextModule,
  LabelModule,
  TableModule,
  DividerModule,
  AppHeaderBarIamModule,
  AppHeaderBarModule,
  StatusLabelModule,
  DateModule,
  DialogModule,
  NumberModule,
  SnackbarModule,
  ReadonlyModule,
  TooltipModule,
  ErrorModule,
  TruncateWithTooltipModule,
} from '@abraxas/base-components';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppStepNavigationModule } from './atoms/step-navigation/step-navigation.module';
import { BreadcrumbsComponent } from './molecules/breadcrumbs/breadcrumbs.component';
import { InfoTooltipComponent } from './molecules/info-tooltip/info-tooltip.component';
import { MultiSelectComponent } from './molecules/multi-select/multi-select.component';
import { TagFormfieldComponent } from './molecules/tag-formfield/tag-formfield.component';
import { CandidacyDetailsComponent } from './organisms/candidacy-details/candidacy-details.component';
import { CandidacyModifyComponent } from './organisms/candidacy-modify/candidacy-modify.component';
import { CandidacyOverviewComponent } from './organisms/candidacy-overview/candidacy-overview.component';
import { CandidacyComponent } from './organisms/candidacy/candidacy.component';
import { DomainsOfInfluenceComponent } from './organisms/domains-of-influence/domains-of-influence.component';
import { ElectionFormExtrasComponent } from './organisms/election-form-extras/election-form-extras.component';
import { ElectionListComponent } from './organisms/election-list/election-list.component';
import { ListSubunionRootComponent } from './organisms/list-subunion-root/list-subunion-root.component';
import { NavigationComponent } from './organisms/navigation/navigation.component';
import { BaseDataComponent } from './pages/base-data/base-data.component';
import { CandidaciesComponent } from './pages/candidacies/candidacies.component';
import { ElectionArchiveComponent } from './pages/election-archiv/election-archive.component';
import { ElectionFormComponent } from './pages/election-modify/election-formular/election-form.component';
import { ElectionGeneralComponent } from './pages/election-modify/election-general/election-general.component';
import { ElectionInfoTextsComponent } from './pages/election-modify/election-info-texts/election-info-texts.component';
import { ElectionModifyComponent } from './pages/election-modify/election-modify.component';
import { ElectionNumberOfSeatsComponent } from './pages/election-modify/number-of-seats/election-number-of-seats.component';
import { ElectionOverviewComponent } from './pages/election-overview/election-overview.component';
import { ListExportComponent } from './pages/list-export/list-export.component';
import { ListIndentureModifyComponent } from './pages/list-indenture-modify/list-indenture-modify.component';
import { ListModifyComponent } from './pages/list-modify/list-modify.component';
import { ListOverviewComponent } from './pages/list-overview/list-overview.component';
import { CommentsComponent } from './organisms/comments/comments.component';
import { SpinnerCenteredComponent } from './molecules/spinner-centered/spinner-centered.component';
import { SpinnerInlineComponent } from './molecules/spinner-inline/spinner-inline.component';
import { SpinnerOverlayComponent } from './molecules/spinner-overlay/spinner-overlay.component';
import { FilepickerComponent } from './molecules/filepicker/filepicker.component';
import { TenantSettingsExportComponent } from './organisms/tenant-settings-logo/tenant-settings-export.component';
import { TenantSettingsComponent } from './organisms/tenant-settings/tenant-settings.component';
import { DocumentListComponent } from './organisms/document-list/document-list.component';
import { DatePickerComponent } from './molecules/date-picker/date-picker.component';
import { TranslationLoader } from './shared/utils/translation-loader';
import { UserAdministrationComponent } from './pages/user-administration/user-administration.component';
import { PartyModifyComponent } from './pages/user-administration/party-modify/party-modify.component';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { UserModifyComponent } from './pages/user-administration/user-modify/user-modify.component';
import { ModifyDomainsOfInfluenceComponent } from './organisms/domains-of-influence/new-domains-of-influence/modify-domains-of-influence.component';
import { ModalDialogComponent } from './shared/components/dialogs/modal-dialog/modal-dialog.component';
import { ExportDialogComponent } from './shared/components/dialogs/export-dialog/export-dialog.component';
import { ENV_INJECTION_TOKEN, VotingLibModule } from '@abraxas/voting-lib';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    ElectionOverviewComponent,
    ElectionArchiveComponent,
    BaseDataComponent,
    UserAdministrationComponent,
    PartyModifyComponent,
    UserModifyComponent,
    ElectionModifyComponent,
    ElectionGeneralComponent,
    ElectionNumberOfSeatsComponent,
    ElectionFormComponent,
    MultiSelectComponent,
    DomainsOfInfluenceComponent,
    CandidacyComponent,
    ElectionFormExtrasComponent,
    ElectionInfoTextsComponent,
    ListOverviewComponent,
    ListModifyComponent,
    DocumentListComponent,
    ElectionListComponent,
    CandidaciesComponent,
    CandidacyOverviewComponent,
    BreadcrumbsComponent,
    CandidacyModifyComponent,
    CandidacyDetailsComponent,
    TagFormfieldComponent,
    InfoTooltipComponent,
    ListIndentureModifyComponent,
    DatePickerComponent,
    ListSubunionRootComponent,
    ListExportComponent,
    CommentsComponent,
    SpinnerCenteredComponent,
    SpinnerInlineComponent,
    SpinnerOverlayComponent,
    FilepickerComponent,
    TenantSettingsExportComponent,
    TenantSettingsComponent,
    ModalDialogComponent,
    ModifyDomainsOfInfluenceComponent,
    ExportDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AppStepNavigationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslationLoader,
      },
    }),
    AuthenticationModule.forAuthentication(environment.authenticationConfig),
    AuthorizationModule.forAuthorization(environment.authorizationConfig),
    ApplicationModule.forRoot(environment.authorizationConfig),
    UserModule.forRoot(environment.userConfig),
    VotingLibModule.forRoot(environment.eawv),
    ButtonModule,
    CheckboxModule,
    TextareaModule,
    RadioButtonModule,
    DragDropModule,
    FormfieldModule,
    DropdownModule,
    IconModule,
    FileInputModule,
    SpinnerModule,
    NavLayoutModule,
    NavigationModule,
    TextModule,
    LabelModule,
    TableModule,
    DividerModule,
    AppHeaderBarIamModule,
    AppHeaderBarModule,
    StatusLabelModule,
    BrowserAnimationsModule,
    DateModule,
    DialogModule,
    NumberModule,
    SnackbarModule,
    ReadonlyModule,
    TooltipModule,
    ErrorModule,
    TruncateWithTooltipModule,
  ],
  providers: [
    Title,
    {
      provide: ENV_INJECTION_TOKEN,
      useValue: environment.env,
    },
    {
      provide: OAuthStorage,
      useClass: AuthStorageService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
