bin_path := ./node_modules/.bin

all: build

install:
	@ npm install

lint:
	@ $(bin_path)/jshint --show-non-errors lib test

test:
	@ $(bin_path)/mocha --reporter spec --recursive test

build: install lint test
	@ $(bin_path)/browserify lib/account-summaries \
		-s gaApiUtils.accountSummaries \
		| uglifyjs -o build/account-summaries.js

.PHONY: all install lint test build
