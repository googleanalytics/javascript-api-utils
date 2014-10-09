/* global describe, it */

var AccountSummaries = require('../../lib/account-summaries/account-summaries');
var assert = require('assert');
var fixtureAccounts = require('./fixtures').get().items;

require('native-promise-only');
require('./stubs/gapi');

describe('AccountSummaries', function() {

  var summaries = new AccountSummaries(fixtureAccounts);

  describe('#all', function() {
    it('returns the full list of accounts', function() {
      assert.deepEqual(summaries.all(), fixtureAccounts);
    });
  });

  describe('#get', function() {
    it('returns an account when passed an accountId param.', function() {
      var account = summaries.get({accountId: 1002});
      assert.equal(account.name, 'Account B');
    });
    it('returns a webProperty when passed a webPropertyId param.', function() {
      var webProperty = summaries.get({webPropertyId: 'UA-1003-1'});
      assert.equal(webProperty.name, 'WebProperty C.A');
    });
    it('returns a webProperty when passed a propertyId param.', function() {
      var webProperty = summaries.get({propertyId: 'UA-1003-1'});
      assert.equal(webProperty.name, 'WebProperty C.A');
    });
    it('returns a profile when passed a profileId param.', function() {
      var profile = summaries.get({profileId: 2006});
      assert.equal(profile.name, 'Profile A.B.C');
    });
    it('returns a profile when passed a viewId param.', function() {
      var profile = summaries.get({viewId: 2006});
      assert.equal(profile.name, 'Profile A.B.C');
    });
    it('throws when passing more than one ID, even if the IDs are for the ' +
        'same entity.', function() {

      assert.throws(function() {
        summaries.get({webPropertyId: 'UA-1003-1', profileId: 3005});
      });
      assert.throws(function() {
        // The profile with id "2001" belongs to the account with ID "1001".
        summaries.get({accountId: 1001, profileId: 2001});
      });
    });
  });

  describe('#getAccount', function() {
    it('returns the account with the specified ID.', function() {
      assert.equal(summaries.getAccount(1003).name, 'Account C');
    });
  });

  describe('#getWebProperty', function() {
    it('returns the web property with the specified ID.', function() {
      assert.equal(
          summaries.getWebProperty('UA-1005-1').name,
          'WebProperty D.A (View-less)');
    });
  });

  describe('#getProperty', function() {
    it('returns the property with the specified ID.', function() {
      assert.equal(
          summaries.getProperty('UA-1005-1').name,
          'WebProperty D.A (View-less)');
    });
  });

  describe('#getProfile', function() {
    it('returns the profile with the specified ID.', function() {
      assert.equal(summaries.getProfile(2010).name, 'Profile B.A.A');
    });
  });

  describe('#getView', function() {
    it('returns the view with the specified ID.', function() {
      assert.equal(summaries.getView(2010).name, 'Profile B.A.A');
    });
  });

  describe('#getAccountByProfileId', function() {
    it('returns the account that contains the specified profile ID.',
        function() {
      assert.equal(summaries.getAccountByViewId(2008).name, 'Account A');
    });
  });

  describe('#getAccountByViewId', function() {
    it('returns the account that contains the specified view ID.',
        function() {
      assert.equal(summaries.getAccountByViewId(2008).name, 'Account A');
    });
  });

  describe('#getWebPropertyByProfileId', function() {
    it('returns the web property that contains the specified profile ID.',
        function() {
      assert.equal(
          summaries.getWebPropertyByProfileId(2011).name,
          'WebProperty C.A');
    });
  });

  describe('#getPropertyByViewId', function() {
    it('returns the property that contains the specified view ID.',
        function() {
      assert.equal(
          summaries.getPropertyByViewId(2011).name,
          'WebProperty C.A');
    });
  });

  describe('#getAccountByWebPropertyId', function() {
    it('returns the account that contains the specified web property ID.',
        function() {
      assert.equal(
          summaries.getAccountByWebPropertyId('UA-1001-3').name,
          'Account A');
    });
  });

  describe('#getAccountByPropertyId', function() {
    it('returns the account that contains the specified property ID.',
        function() {
      assert.equal(
          summaries.getAccountByPropertyId('UA-1001-3').name,
          'Account A');
    });
  });

});
