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


/* global gapi:true */


var clone = require('lodash/cloneDeep');
var merge = require('lodash/merge');
var namespace = require('mout/object/namespace');
var sinon = require('sinon');


module.exports = function(fixtureMap, stubOpts) {

  namespace(global, 'gapi.client');
  gapi.client.request = gapi.client.request || function() {};

  return sinon.stub(gapi.client, 'request', function(callOpts) {

    var options = merge({}, callOpts, stubOpts);
    var params = options.params || {};

    // Clone the fixtures so object modifications don't persist.
    var response = { result: clone(fixtureMap[options.path]) };

    if (!response.result) {
      console.log(options);
    }

    // Account for the parameters "start-index" and "max-results".
    response.result.startIndex = params['start-index'] || 1;
    response.result.itemsPerPage = params['max-results'] || 1000;

    if (response.result.items) {
      response.result.items = response.result.items.splice(
          response.result.startIndex - 1, response.result.itemsPerPage);
    }

    return {
      then: function(fn) {
        return Promise.resolve(fn(response));
      }
    };
  });

};
