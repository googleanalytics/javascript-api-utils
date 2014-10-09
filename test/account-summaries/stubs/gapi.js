/* global gapi:true */

var fixtures = require('../fixtures');

// Assign this globally because that's how it is IRL.
gapi = {client: {analytics: {management: {accountSummaries: {}}}}};

gapi.client.analytics.management.accountSummaries.list = function(options) {

  return {
    execute: function(cb) {
      var results = fixtures.get();
      results.startIndex = options['start-index'] || 1;
      results.itemsPerPage = options['max-results'] || 1000;

      // If a user has no accounts, items will not be defined.
      if (results.items) {
        results.items = results.items.splice(
            results.startIndex - 1,results.itemsPerPage);
      }

      setTimeout(cb.bind(null, results, 0));
    }
  };
};
