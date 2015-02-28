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
var gapiClientRequest = require('../_stubs/gapi-client-request');
var metadata = require('../../lib/metadata');


function getFixture(name) {
  return require('../_fixtures/' + name);
}


describe('metadata', function() {

  describe('.get', function() {

    it('returns a "thenable" that is resolved with a metadata instance.',
        function(done) {

      var fixture = getFixture('metadata');
      var requestStub = gapiClientRequest(fixture);

      var returnValue = metadata.get();
      assert('then' in returnValue);

      returnValue.then(function(metadata) {
        assert.deepEqual(metadata.all(), fixture.items);
        done();
      })
      .catch(done);

      requestStub.restore();
    });

    it('does not query the API more than once, even with multiple calls.',
        function(done) {

      var fixture = getFixture('metadata');
      var requestStub = gapiClientRequest(fixture);

      metadata.get().then(function(metadata1) {
        metadata.get().then(function(metadata2) {
          metadata.get().then(function(metadata3) {

            // It will be one if this test is run alone, zero if another
            // test has run before it. Either way it's not 3.
            assert(requestStub.callCount <= 1);

            assert.equal(metadata1, metadata2);
            assert.equal(metadata2, metadata3);
            assert.deepEqual(metadata3.all(), fixture.items);

            requestStub.restore();
            done();
          })
          .catch(done);
        });
      });
    });

    it('accepts an optional parameter to clear the cache.', function(done) {

      var fixture = getFixture('metadata');
      var requestStub = gapiClientRequest(fixture);

      metadata.get(true).then(function(metadata1) {
        metadata.get(true).then(function(metadata2) {
          metadata.get(true).then(function(metadata3) {

            assert.equal(requestStub.callCount, 3);

            // When clearing the cache these should be deepEqual but
            // not the same object.
            assert.notEqual(metadata1, metadata2);
            assert.notEqual(metadata2, metadata3);
            assert.deepEqual(metadata1, metadata2);
            assert.deepEqual(metadata2, metadata3);

            assert.deepEqual(metadata3.all(), fixture.items);

            requestStub.restore();
            done();
          })
          .catch(done);
        });
      });

    });

  });

});
