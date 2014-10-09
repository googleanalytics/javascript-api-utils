var accountSummariesFixtureWithAccounts =
    require('./account-summaries-with-accounts');

var accountSummariesFixtureWithoutAccounts =
    require('./account-summaries-without-accounts');

var currentFixture = accountSummariesFixtureWithAccounts;

module.exports = {
  get: function() {
    return JSON.parse(JSON.stringify(currentFixture));
  },
  set: function(choice) {
    currentFixture = (choice == 'with-accounts') ?
      accountSummariesFixtureWithAccounts :
      accountSummariesFixtureWithoutAccounts;
  }
};
