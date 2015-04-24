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

    it('returns a promise that is resolved with a metadata instance ' +
        'containing all standard columns.', function(done) {

      var fixture = getFixture('metadata');
      var requestStub = gapiClientRequest({
        '/analytics/v3/metadata/ga/columns': fixture
      });

      var returnValue = metadata.get();
      assert(returnValue instanceof Promise);

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
      var requestStub = gapiClientRequest({
        '/analytics/v3/metadata/ga/columns': fixture
      });

      metadata.get().then(function(metadata1) {
        metadata.get().then(function(metadata2) {
          metadata.get().then(function(metadata3) {

            // `callCount` will be one if this test is run alone, zero if
            // another test has run before it. Either way it's not 3.
            assert(requestStub.callCount <= 1);

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

  describe('.getAuthenticated', function() {

    var fixtureMap = {};
    fixtureMap['/analytics/v3/metadata/ga/columns'] = getFixture('metadata');
    fixtureMap['/analytics/v3/management/accounts/12345/webproperties/' +
        'UA-12345-1/customMetrics'] = getFixture('custom-metrics');
    fixtureMap['/analytics/v3/management/accounts/12345/webproperties/' +
        'UA-12345-1/customDimensions'] = getFixture('custom-dimensions');
    fixtureMap['/analytics/v3/management/accounts/12345/webproperties/' +
        'UA-12345-1/profiles/6789/goals'] = getFixture('goals');

    var requestStub;

    beforeEach(function() {
      requestStub = gapiClientRequest(fixtureMap);
    });

    afterEach(function() {
      requestStub.restore();
    });

    it('returns a promise that is resolved with a metadata instance ' +
        'containing columns unique to this property/view.', function(done) {

      var returnValue = metadata.getAuthenticated({id: 12345},
          {id: 'UA-12345-1'}, {id: 6789});

      assert(returnValue instanceof Promise);

      returnValue.then(function(metadata) {
        assert.deepEqual(
          metadata.all(),
          getFixture('metadata-authenticated').items
        );
        done();
      })
      .catch(done);
    });

    it('uses the premium template for premium properties.', function(done) {

      metadata.getAuthenticated(
        {id: 12345},
        {id: 'UA-12345-1', level: 'PREMIUM'},
        {id: 6789}
      )
      .then(function(metadata) {
        assert.deepEqual(
          metadata.all(),
          getFixture('metadata-authenticated-premium').items
        );
        done();
      })
      .catch(done);

      requestStub.restore();
    });

    it('does not query the API more than once, even with multiple calls.',
        function(done) {

      var call = metadata.getAuthenticated.bind(metadata, {id: 12345},
          {id: 'UA-12345-1'}, {id: 6789});

      call().then(function(metadata1) {
        call().then(function(metadata2) {
          call().then(function(metadata3) {

            // `callCount` will be one if this test is run alone, zero if
            // another test has run before it. Either way it's not 3.
            assert(requestStub.callCount <= 1);

            assert.deepEqual(metadata1, metadata2);
            assert.deepEqual(metadata2, metadata3);
            assert.deepEqual(
              metadata3.all(),
              getFixture('metadata-authenticated').items
            );

            requestStub.restore();
            done();
          })
          .catch(done);
        });
      });
    });

  });

  describe('.clearCache', function() {

    it('clears the cache.', function(done) {

      var fixture = getFixture('metadata');
      var requestStub = gapiClientRequest({
        '/analytics/v3/metadata/ga/columns': fixture
      });

      metadata.clearCache();
      metadata.get().then(function() {

        metadata.clearCache();
        metadata.get().then(function() {

          metadata.clearCache();
          metadata.get().then(function() {

            assert.equal(requestStub.callCount, 3);

            requestStub.restore();
            done();
          })
          .catch(done);
        });
      });

    });

  });

});
