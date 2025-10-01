(function (window) {
  window['config'] = window['config'] || {};
  window['config'].ENV = '${ENV}';
  window['config'].API_BASE = '${API_BASE}';
  window['config'].CLIENT_ID = '${CLIENT_ID}';
  window['config'].ISSUER = '${ISSUER}';
  window['config'].SEC_APIS = '${SEC_APIS}';
  window['config'].OAUTH_SCOPES = '${OAUTH_SCOPES}';
})(this);
