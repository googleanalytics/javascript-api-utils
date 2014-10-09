/**
 * @constuctor AccountSummaries
 */
function AccountSummaries(summaries) {
  this.summaries_ = summaries;
  this.setup_();
}


/**
 * `setup_` takes the multidimensional summaries_ array property and write
 * the following new properties: `accountsById_`, `webPropertiesById_`, and
 * `profilesById_`.  Each of these contains an array of objects where the
 * key is the entity ID and the value is an object containing the entity and
 * the entity's parents. For example, an object in the `profilesById_` array
 * might look like this:
 *     {
 *       "1234": {
 *         self: {...},
 *         parent: {...},
 *         grandParent: {...}
 *       }
 *     }
 *
 * It also aliases the properties `webProperties` to `properties` and
 * `profiles` to `views`.
 *
 * @private
 */
AccountSummaries.prototype.setup_ = function() {

  this.accountsById_ = {};
  this.webPropertiesById_ = this.propertiesById_ = {};
  this.profilesById_ = this.viewsById_ = {};

  for (var i = 0, account; account = this.summaries_[i]; i++) {
    this.accountsById_[account.id] = {
      self: account
    };
    if (!account.webProperties) continue;

    // Add aliases.
    alias(account, 'webProperties', 'properties');

    for (var j = 0, webProperty; webProperty = account.webProperties[j]; j++) {
      this.webPropertiesById_[webProperty.id] = {
        self: webProperty,
        parent: account
      };
      if (!webProperty.profiles) continue;

      // Add aliases.
      alias(webProperty, 'profiles', 'views');

      for (var k = 0, profile; profile = webProperty.profiles[k]; k++) {
        this.profilesById_[profile.id] = {
          self: profile,
          parent: webProperty,
          grandParent: account
        };
      }
    }
  }
};


/**
 * Return the full accountSummaries array.
 * @return {Array}
 */
AccountSummaries.prototype.all = function() {
  return this.summaries_;
};


/**
 * Returns an account, web property or profile given the passed ID in the
 * `idData` object.  The ID data object can contain only one of the
 * following properties: "accountId", "webPropertyId", "propertyId",
 * "profileId", or "viewId".  If more than one key is passed, an error is
 * thrown.
 *
 * @param {Object} obj An object with no more than one of the following
 *     keys: "accountId", "webPropertyId", "propertyId", "profileId" or
 *     "viewId".
 * @return {Object|undefined} The matching account, web property, or
 *     profile. If none are found, undefined is returned.
 */
AccountSummaries.prototype.get = function(obj) {
  if (!!obj.accountId +
      !!obj.webPropertyId +
      !!obj.propertyId +
      !!obj.profileId +
      !!obj.viewId > 1) {

    throw new Error('get() only accepts an object with a single ' +
        'property: either "accountId", "webPropertyId", "propertyId", ' +
        '"profileId" or "viewId"');
  }
  return this.getProfile(obj.profileId || obj.viewId) ||
      this.getWebProperty(obj.webPropertyId || obj.propertyId) ||
      this.getAccount(obj.accountId);
};


/**
 * Get an account given its ID.
 * @param {string|number} accountId
 * @return {Object} The account with the given ID.
 */
AccountSummaries.prototype.getAccount = function(accountId) {
  return this.accountsById_[accountId] &&
      this.accountsById_[accountId].self;
};


/**
 * Get a web property given its ID.
 * @param {string} webPropertyId
 * @return {Object} The web property with the given ID.
 */
AccountSummaries.prototype.getWebProperty = function(webPropertyId) {
  return this.webPropertiesById_[webPropertyId] &&
      this.webPropertiesById_[webPropertyId].self;
};


/**
 * Get a profile given its ID.
 * @param {string|number} profileId
 * @return {Object} The profile with the given ID.
 */
AccountSummaries.prototype.getProfile = function(profileId) {
  return this.profilesById_[profileId] &&
      this.profilesById_[profileId].self;
};


/**
 * Get an account given the ID of one of its profiles.
 * @param {string|number} profileId
 * @return {Object} The account containing this profile.
 */
AccountSummaries.prototype.getAccountByProfileId = function(profileId) {
  return this.profilesById_[profileId] &&
      this.profilesById_[profileId].grandParent;
};


/**
 * Get a web property given the ID of one of its profile.
 * @param {string|number} profileId
 * @return {Object} The web property containing this profile.
 */
AccountSummaries.prototype.getWebPropertyByProfileId = function(profileId) {
  return this.profilesById_[profileId] &&
      this.profilesById_[profileId].parent;
};


/**
 * Get an account given the ID of one of its web properties.
 * @param {string|number} webPropertyId
 * @return {Object} The account containing this web property.
 */
AccountSummaries.prototype.getAccountByWebPropertyId =
    function(webPropertyId) {

  return this.webPropertiesById_[webPropertyId] &&
      this.webPropertiesById_[webPropertyId].parent;
};


alias(AccountSummaries.prototype, 'getWebProperty',
                                  'getProperty');

alias(AccountSummaries.prototype, 'getProfile',
                                  'getView');

alias(AccountSummaries.prototype, 'getWebPropertyByProfileId',
                                  'getPropertyByViewId');

alias(AccountSummaries.prototype, 'getAccountByProfileId',
                                  'getAccountByViewId');

alias(AccountSummaries.prototype, 'getAccountByWebPropertyId',
                                  'getAccountByPropertyId');



/**
 * Alias a property of an object using es5 getters. If es5 getters are not
 * supported, just add the aliased property directly to the object.
 * @param {Object} object The object for which you want to alias properties.
 * @param {string} referenceProp The reference property.
 * @param {string} aliasName The reference property's alias name.
 */
function alias(object, referenceProp, aliasName) {
  if (Object.defineProperty) {
    Object.defineProperty(object, aliasName, {
      get: function() {
        return object[referenceProp];
      }
    });
  }
  else {
    object[aliasName] = object[referenceProp];
  }
}


module.exports = AccountSummaries;
