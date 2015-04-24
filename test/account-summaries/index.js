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


var accountSummaries = require('../../lib/account-summaries');
var assert = require('assert');
var gapiClientRequest = require('../_stubs/gapi-client-request');


function getFixture(name) {
  return require('../_fixtures/' + name);
}


describe('accountSummaries', function() {

  describe('.get', function() {

    it('returns a "thenable" that is resolved with an account summaries array.',
        function(done) {

      var fixture = getFixture('account-summaries');
      var requestStub = gapiClientRequest({
        '/analytics/v3/management/accountSummaries': fixture
      });

      var returnValue = accountSummaries.get();
      assert('then' in returnValue);

      returnValue.then(function(summaries) {
        assert.deepEqual(summaries.all(), fixture.items);
        done();
      })
      .catch(done);

      requestStub.restore();
    });

    it('does not query the API more than once, even with multiple calls.',
        function(done) {

      var fixture = getFixture('account-summaries');
      var requestStub = gapiClientRequest({
        '/analytics/v3/management/accountSummaries': fixture
      });

      accountSummaries.get().then(function(summaries1) {
        accountSummaries.get().then(function(summaries2) {
          accountSummaries.get().then(function(summaries3) {

            // It will be one if this test is run alone, zero if another
            // test has run before it. Either way it's not 3.
            assert(requestStub.callCount <= 1);

            assert.equal(summaries1, summaries2);
            assert.equal(summaries2, summaries3);
            assert.deepEqual(summaries3.all(), fixture.items);

            requestStub.restore();
            done();
          })
          .catch(done);
        });
      });
    });

    it('accepts an optional parameter to clear the cache.', function(done) {

      var fixture = getFixture('account-summaries');
      var requestStub = gapiClientRequest({
        '/analytics/v3/management/accountSummaries': fixture
      });

      accountSummaries.get(true).then(function(summaries1) {
        accountSummaries.get(true).then(function(summaries2) {
          accountSummaries.get(true).then(function(summaries3) {

            assert.equal(requestStub.callCount, 3);

            // When clearing the cache these should be deepEqual but
            // not the same object.
            assert.notEqual(summaries1, summaries2);
            assert.notEqual(summaries2, summaries3);
            assert.deepEqual(summaries1, summaries2);
            assert.deepEqual(summaries2, summaries3);

            assert.deepEqual(summaries3.all(), fixture.items);

            requestStub.restore();
            done();
          })
          .catch(done);
        });
      });

    });

    it('returns the full account summaries list, not a paginatated one.',
        function(done) {

      var fixture = getFixture('account-summaries');
      var requestStub = gapiClientRequest({
        '/analytics/v3/management/accountSummaries': fixture
      }, {
        params: {
          'max-results': 2
        }
      });

      accountSummaries.get(true).then(function(summaries) {
        // `gapi.client.request` will be called three times because
        // the response is paginated.
        assert.equal(requestStub.callCount, 3);

        // The full response is returned, not just 2 items.
        assert.deepEqual(summaries.all(), fixture.items);

        requestStub.restore();
        done();
      })
      .catch(done);

    });

    it('throws if the user requesting the summares does not have any ' +
        'Google Analytics accounts.', function(done) {

      var fixture = getFixture('account-summaries-no-accounts');
      var requestStub = gapiClientRequest({
        '/analytics/v3/management/accountSummaries': fixture
      });
      
      accountSummaries.get(true).catch(function(err) {
        assert.equal(err.message, 'You do not have any Google Analytics ' +
            'accounts. Go to http://google.com/analytics to sign up.');

        requestStub.restore();
        done();
      });
    });

  });

});
