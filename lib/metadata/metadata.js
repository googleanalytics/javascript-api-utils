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


/**
 * @constuctor Metadata
 *
 * Takes an array of metadata columns...

 * @param {Array} columns A list of columns in the format returned by the
 *     metadata API's column#list method.
 * @returns {AccountSummaries}
 */
function Metadata(columns) {
  this._columns = columns;

  this._metrics = [];
  this._dimensions = [];
  this._ids = {};

  this._columns.forEach(function(column) {
    this._ids[column.id] = column.attributes;

    if (column.attributes.type == 'METRIC') {
      this._metrics.push(column);
    }
    else if (column.attributes.type == 'DIMENSION') {
      this._dimensions.push(column);
    }
  }.bind(this));
}


/**
 * Returns an array of all columns, with an optional filter applied.
 * @param {Object|Function} filter An optional filter object or function.
 *     If an object is passed, all property values must match. If a function is
 *     passed, it is invoked with the column's attributes object and the
 *     the column will be included if the function returns true.
 * @return {Array} A list of columns passing the filter.
 */
Metadata.prototype.all = function(filter) {
  return filter ? applyFilter(this._columns, filter) : this._columns;
};


/**
 * Returns an array of all metric columns, with an optional filter applied.
 * @param {Object|Function} filter An optional filter object or function.
 *     If an object is passed, all property values must match. If a function is
 *     passed, it is invoked with the column's attributes object and the
 *     the column will be included if the function returns true.
 * @return {Array} A list of metric columns passing the filter.
 */
Metadata.prototype.allMetrics = function(filter) {
  return filter ? applyFilter(this._metrics, filter) : this._metrics;
};


/**
 * Returns an array of all dimension columns, with an optional filter applied.
 * @param {Object|Function} filter An optional filter object or function.
 *     If an object is passed, all property values must match. If a function is
 *     passed, it is invoked with the column's attributes object and the
 *     the column will be included if the function returns true.
 * @return {Array} A list of dimension columns passing the filter.
 */
Metadata.prototype.allDimensions = function(filter) {
  return filter ? applyFilter(this._dimensions, filter) : this._dimensions;
};


/**
 * Get the attributs object of a column given the passed ID.
 * @param {string} id The column ID.
 * @return {Object} The column attributes object.
 */
Metadata.prototype.get = function(id) {
  return this._ids[id];
};


/**
 * Returns a list of metadata columns passing a filter.
 * @param {Array} columns The list of metadata columns.
 * @param {Object|Function} filter An object or function filter.
 *     If an object is passed, all property values must exactly match the
 *     corresponding column attributes. If a function is passed, it is invoked
 *     with the column's attributes object as the first argument and the
 *     column's ID as the second argument. The column will be included if the
 *     function returns true.
 * @return {Array} The new columns after the filter has been applied.
 */
function applyFilter(columns, filter) {
  return columns.filter(function(column) {
    if (typeof filter == 'function') {
      return filter(column.attributes, column.id);
    }
    else {
      return Object.keys(filter).every(function(key) {
        return filter[key] === column.attributes[key];
      });
    }
  });
}


module.exports = Metadata;
