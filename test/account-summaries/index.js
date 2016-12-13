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

      accountSummaries.get().then(function() {
        accountSummaries.get().then(function() {
          accountSummaries.get().then(function() {

            // It will be one if this test is run alone, zero if another
            // test has run before it. Either way it's not 3.
            assert(requestStub.callCount <= 1);

            requestStub.restore();
            done();
          })
          .catch(done);
        });
      });
    });

    it('accepts a noCache option to clear the cache.', function(done) {

      var fixture = getFixture('account-summaries');
      var requestStub = gapiClientRequest({
        '/analytics/v3/management/accountSummaries': fixture
      });

      accountSummaries.get({noCache: true}).then(function() {
        accountSummaries.get({noCache: true}).then(function() {
          accountSummaries.get({noCache: true}).then(function() {

            assert.equal(requestStub.callCount, 3);

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

      accountSummaries.get({noCache: true}).then(function(summaries) {
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

    it('optionally ignores empty properties/views', function(done) {
      var fixture = getFixture('account-summaries');
      var requestStub = gapiClientRequest({
        '/analytics/v3/management/accountSummaries': fixture
      });

      accountSummaries.get({ignoreEmpty: true}).then(function(summaries) {
        assert.deepEqual(
            summaries.all(),
            getFixture('account-summaries-empties-ignored').items);

        requestStub.restore();
        done();
      })
      .catch(done);
    });
  });
});
