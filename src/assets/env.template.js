(function (window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["name"] = "${ENVIRONMENT}";
  window["env"]["googleClientId"] = "${GOOGLE_CLIENT_ID}";
  window["env"]["facebookClientId"] = "${FACEBOOK_CLIENT_ID}";
  window["env"]["envDomain"] = '${ENV_DOMAIN}';
  window["env"]["adminHostURL"] = "${ADMIN_HOST_URL}";
  window['env']['hubriseClientId'] = '${HUBRISE_CLIENT_ID}';
})(this);
