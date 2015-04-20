// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/* global gapi */


var Metadata = require('./metadata');


/**
 * Store the metadata result in a promise so the API isn't
 * queried unneccesarily.
 */
var cache = {};


/**
 * A simple deep clone function for JSON format-able data.
 * @param {Object} obj The object to clone.
 * @return {Object} The cloned object.
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


/**
 * Make a request to `metadata.columns.list` and cache the response. If a
 * cached response already exists, return that.
 * @return {goog.Promise} The response promise.
 */
function requestColumns() {
  var key = 'columns';
  if (cache[key]) return cache[key];

  return cache[key] = gapi.client.request({
    path: '/analytics/v3/metadata/ga/columns',
    params: {reportType: 'ga'}
  });
}


/**
 * Make a request to `management.customMetrics.list` and cache the response.
 * If a cached response already exists, return that.
 * @param {number} accountId The ID of the account to fetch data from.
 * @param {string} propertyId The ID of the property to fetch data from.
 * @return {goog.Promise} The response promise.
 */
function requestCustomMetrics(accountId, propertyId) {
  var key = 'customMetrics:' + accountId + ':' + propertyId;
  if (cache[key]) return cache[key];

  return cache[key] = gapi.client.request({
    path: '/analytics/v3/management/accounts/' + accountId +
          '/webproperties/' + propertyId + '/customMetrics'
  });
}


/**
 * Make a request to `management.customDimensions.list` and cache the response.
 * If a cached response already exists, return that.
 * @param {number} accountId The ID of the account to fetch data from.
 * @param {string} propertyId The ID of the property to fetch data from.
 * @return {goog.Promise} The response promise.
 */
function requestCustomDimensions(accountId, propertyId) {
  var key = 'customDimensions:' + accountId + ':' + propertyId;
  if (cache[key]) return cache[key];

  return cache[key] = gapi.client.request({
    path: '/analytics/v3/management/accounts/' + accountId +
          '/webproperties/' + propertyId + '/customDimensions'
  });
}


/**
 * Make a request to `management.goals.list` and cache the response.
 * If a cached response already exists, return that.
 * @param {number} accountId The ID of the account to fetch data from.
 * @param {string} propertyId The ID of the property to fetch data from.
 * @param {number} viewId The ID of the view to fetch data from.
 * @return {goog.Promise} The response promise.
 */
function requestGoals(accountId, propertyId, viewId) {
  var key = 'goals:' + accountId + ':' + propertyId + ':' + viewId;
  if (cache[key]) return cache[key];

  return cache[key] = gapi.client.request({
    path: '/analytics/v3/management/accounts/' + accountId +
          '/webproperties/' + propertyId +
          '/profiles/' + viewId +
          '/goals'
  });
}


/**
 * Accept a list of columns along with a list of custom metrics, custom
 * dimensions, and goals, and populate the templatized column data with the
 * account-specific data. Any remaining templatized columns are populated
 * account to the min/max template index values.
 * @param {Array} columns The items from `metadata.columns.list`.
 * @param {Array} customMetrics The items from `management.customMetrics.list`.
 * @param {Array} customDimensions The items from
      `management.customDimensions.list`.
 * @param {Array} goals The items from `management.goals.list`.
 * @param {boolean} isPremium True if the property is premium level.
 * @return {Array} The populated columns.
 */
function populateColumns(columns, customMetrics, customDimensions,
    goals, isPremium) {

  var newColumns = [];
  columns.forEach(function(column, i) {
    if (column.attributes.minTemplateIndex) {

      // Add custom metrics.
      if (column.id == 'ga:metricXX') {
        customMetrics.forEach(function(customMetric, i) {
          var newColumn = clone(column);
          newColumn.id = customMetric.id;
          newColumn.attributes.uiName = customMetric.name +
              ' (Custom Metric ' + (i + 1) + ')';
          newColumns.push(newColumn);
        });
      }

      // Add custom dimensions.
      else if (column.id == 'ga:dimensionXX') {
        customDimensions.forEach(function(customDimension, i) {
          var newColumn = clone(column);
          newColumn.id = customDimension.id;
          newColumn.attributes.uiName = customDimension.name +
              ' (Custom Dimension ' + (i + 1) + ')';
          newColumns.push(newColumn);
        });
      }

      // Add goals.
      else if (/goal/i.test(column.id)) {
        goals.forEach(function(goal) {
          var newColumn = clone(column);
          newColumn.id = column.id.replace('XX', goal.id);
          newColumn.attributes.uiName = goal.name + ' ' +
              '(' + column.attributes.uiName.replace('XX', goal.id) + ')';
          newColumns.push(newColumn);
        });
      }

      // Expand templatized columns.
      else {
        var min = isPremium ? +column.attributes.premiumMinTemplateIndex :
            +column.attributes.minTemplateIndex;
        var max = isPremium ? +column.attributes.premiumMaxTemplateIndex :
            +column.attributes.maxTemplateIndex;
        for (var i = min; i <= max; i++) {
          var newColumn = clone(column);
          newColumn.id = column.id.replace('XX', i);
          newColumn.attributes.uiName =
              column.attributes.uiName.replace('XX', i);
          newColumns.push(newColumn);
        }
      }
    }
    else {
      newColumns.push(column);
    }
  });

  return newColumns;
}

/**
 * @module metadata
 *
 * This module requires the `gapi.client` library to be installed and the user
 * to be authenticated.
 */
module.exports = {

  /**
   * Return the `requestMetadata` promise. If the promise exists,
   * return it to avoid multiple requests. If the promise does not exist,
   * initiate the request and cache the promise.
   *
   * @return {Promise} A promise fulfilled with a Metadata instance.
   */
  get: function() {
    return Promise.resolve(requestColumns()).then(function(resp) {
      return new Metadata(resp.result.items);
    });
  },

  getAuthenticated: function(accountId, propertyId, viewId, isPremium) {
    return Promise.all([
      requestColumns(),
      requestCustomMetrics(accountId, propertyId),
      requestCustomDimensions(accountId, propertyId),
      requestGoals(accountId, propertyId, viewId)
    ])
    .then(function(responses) {
      var columns = responses[0].result.items;
      var customMetrics = responses[1].result.items;
      var customDimensions = responses[2].result.items;
      var goals = responses[3].result.items;
      return populateColumns(columns, customMetrics, customDimensions,
          goals, isPremium);
    })
    .then(function(columns) {
      return new Metadata(columns);
    });
  },

  clearCache: function() {
    cache = {};
  }
};
