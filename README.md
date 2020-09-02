# No longer actively maintained
You should migrate to using [gapi](https://github.com/google/google-api-javascript-client/blob/master/docs/start.md) directly. 

Google Analytics JavaScript API Utilities
=========================================

This repository is a place to find utility modules for interacting with the Google Analytics APIs. The source files are available as node-style modules (in the [/lib](https://github.com/googleanalytics/javascript-api-utils/tree/master/lib) folder) and as standalone browser scripts (in the [build](https://github.com/googleanalytics/javascript-api-utils/tree/master/build) folder). The browser versions are built with [browserify](http://browserify.org/) and can be accessed from the global object `window.gaApiUtils` or by using an AMD module loader.

## Installation

```sh
# Install via npm
npm install git+https://git@github.com/googleanalytics/javascript-api-utils.git

# Install via bower
npm install googleanalytics/javascript-api-utils
```

## Usage Examples:

**Note**: all the examples below assume the user is authenticated and [`gapi.client`](https://developers.google.com/api-client-library/javascript/start/start-js) is loaded on the page. They also assume the browser supports promises. If you're including this library on sites where modern browser usage isn't guaranteed, a [Promise polyfill](https://github.com/addyosmani/es6-tools#polyfills) is required.

### Account Summaries

```js
var accountSummaries = require('javascript-api-utils/lib/account-summaries');

// Log a list of all the user's Google Analytics views to the console.
accountSummaries.get().then(function(summaries) {
  console.log(summaries.allViews());
});
```

### Metadata

```js
var metadata = require('javascript-api-utils/lib/metadata');

// Log a list of all the user's Google Analytics views to the console.
metadata.get().then(function(columns) {
  console.log(columns.allMetrics());
});
```

To see a demo of these modules in action, run the [demo file](https://github.com/googleanalytics/javascript-api-utils/blob/master/build/demo.html) on a local server on port 8080.

## Contributing

If you'd like to contribute modules to this repository please follow the [Google JavaScript style guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml) and make sure to include relevant tests with any pull requests. Also include demos where appropriate.

### Running the tests

```sh
make test
```

### Building the browser versions

```sh
make build
```
