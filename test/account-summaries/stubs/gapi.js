/* global gapi:true, Promise:true */

var fixtures = require('../fixtures');

// Polyfill Promises for node.
Promise = require('native-promise-only');

// Assign this globally because that's how it is IRL.
gapi = {client: {analytics: {management: {accountSummaries: {}}}}};

gapi.client.analytics.management.accountSummaries.list = function(options) {

  options = options || {};

  var response = { result: fixtures.get() };

  response.result.startIndex = options['start-index'] || 1;
  response.result.itemsPerPage = options['max-results'] || 1000;

  // If a user has no accounts, items will not be defined.
  if (response.result.items) {
    response.result.items = response.result.items.splice(
        response.result.startIndex - 1, response.result.itemsPerPage);
  }

  return {
    then: function(fn) {
      return Promise.resolve(fn(response));
    }
  };
};
