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


var assert = require('assert');
var Metadata = require('../../lib/metadata/metadata');

var columns = require('../_fixtures/metadata.json').items;

var integerColumns = columns.filter(function(column) {
  return column.attributes.dataType == 'INTEGER';
});

var metrics = columns.filter(function(column) {
  return column.attributes.type == 'METRIC';
});

var v3publicMetrics = metrics.filter(function(metric) {
  return metric.attributes.status == 'PUBLIC' &&
      metric.attributes.addedInApiVersion === '3';
});

var integerMetrics = metrics.filter(function(metric) {
  return metric.attributes.dataType == 'INTEGER';
});

var dimensions = columns.filter(function(column) {
  return column.attributes.type == 'DIMENSION';
});

var v3publicDimensions = dimensions.filter(function(dimension) {
  return dimension.attributes.status == 'PUBLIC' &&
      dimension.attributes.addedInApiVersion === '3';
});

var integerDimensions = dimensions.filter(function(dimension) {
  return dimension.attributes.dataType == 'INTEGER';
});


describe('Metadata', function() {

  var metadata = new Metadata(columns);

  describe('#all', function() {
    it('returns the full list of columns.', function() {
      assert.deepEqual(metadata.all(), columns);
    });

    it('accepts an optional filter argument object.', function() {
      var filter = {type: 'METRIC', status: 'PUBLIC', addedInApiVersion: '3'};
      assert.deepEqual(metadata.all(filter), v3publicMetrics);
    });

    it('accepts an optional filter argument function.', function() {
      var filter = function(attributes, id) {
        assert(typeof attributes == 'object');
        assert(/^ga:/.test(id));
        return attributes.dataType == 'INTEGER';
      };
      assert.deepEqual(metadata.all(filter), integerColumns);
    });
  });

  describe('#allMetrics', function() {
    it('gets only the columns that are metrics', function() {
      assert.deepEqual(metadata.allMetrics(), metrics);
    });

    it('accepts an optional filter argument.', function() {
      var filter = {addedInApiVersion: '3', status: 'PUBLIC'};
      assert.deepEqual(metadata.allMetrics(filter), v3publicMetrics);
    });

    it('accepts an optional filter argument function.', function() {
      var filter = function(attributes, id) {
        assert(typeof attributes == 'object');
        assert(/^ga:/.test(id));
        return attributes.dataType == 'INTEGER';
      };
      assert.deepEqual(metadata.allMetrics(filter), integerMetrics);
    });
  });

  describe('#allDimensions', function() {
    it('gets only the columns that are dimensions', function() {
      assert.deepEqual(metadata.allDimensions(), dimensions);
    });

    it('accepts an optional filter argument.', function() {
      var filter = {addedInApiVersion: '3', status: 'PUBLIC'};
      assert.deepEqual(metadata.allDimensions(filter), v3publicDimensions);
    });

    it('accepts an optional filter argument function.', function() {
      var filter = function(attributes) {
        return attributes.dataType == 'INTEGER';
      };
      assert.deepEqual(metadata.allDimensions(filter), integerDimensions);
    });
  });

  describe('#get', function() {
    it('gets the attributes object of a column given an ID.', function() {
      assert.deepEqual(metadata.get('ga:users'), columns[7].attributes);
    });
  });

});
