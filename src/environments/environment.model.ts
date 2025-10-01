/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthenticationConfig, AuthorizationConfig, UserConfig } from '@abraxas/base-components';
import { AuthConfig } from 'angular-oauth2-oidc';

export interface Environment {
  production: boolean;
  env: string;
  authAllowedUrls?: string[];
  authenticationConfig: AuthenticationConfig & Required<Pick<AuthConfig, 'clientId' | 'issuer' | 'scope'>>;
  authorizationConfig: AuthorizationConfig;
  userConfig: UserConfig;
  eawv: string;
}
