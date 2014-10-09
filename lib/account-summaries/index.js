/* global gapi, Promise */

var AccountSummaries = require('./account-summaries');


/**
 * Store the accountSummaries result in a promise so the API isn't
 * queried unneccesarily.
 */
var promise;


/**
 * Make a request to the Management API's accountSummaries#list method.
 * If the requests returns a partial, paginated response, query again
 * until the full summaries are retrieved.
 * @return {Promise} A promise that will resolve to the full response.
 */
function requestAccountSummaries() {
  return new Promise(function(resolve, reject) {

    var summaries = [];

    function makeRequest(startIndex) {
      gapi.client.analytics.management.accountSummaries
          .list({'start-index': startIndex || 1})
          .execute(ensureComplete);
    }

    function ensureComplete(resp) {
      // Reject the promise if the API returns an error.
      if (resp.error) reject(new Error(resp.message));

      if (resp.items) {
        summaries = summaries.concat(resp.items);
      }
      else {
        reject(new Error('You do not have any Google Analytics accounts. ' +
            'Go to http://google.com/analytics to sign up.'));
      }

      if (resp.startIndex + resp.itemsPerPage <= resp.totalResults) {
        makeRequest(resp.startIndex + resp.itemsPerPage);
      }
      else {
        resolve(new AccountSummaries(summaries));
      }
    }

    makeRequest();
  });
}


/**
 * @module accountSummaries
 *
 * This module requires a Promise implementation (or a Promise polyfill).
 * It also required the `gapi.client.analytics` library to be installed
 * and the user to be authenticated.
 */
module.exports = {

  /**
   * Return the `requestAccountSummaries` promise. If the promise exists,
   * return it to avoid multiple requests. If the promise does not exist,
   * initiate the request and cache the promise.
   *
   * @param {boolean} noCache When true make a request no matter what.
   * @return {Promise} A promise fulfilled with the decorated summaries
   *     array.
   */
  get: function(noCache) {
    if (noCache) promise = null;
    return promise || (promise = requestAccountSummaries());
  }
};
