install:
	npm install

start:
	npx babel-node src/bin/gendiff.js

publish:
	npm publish --dry-run

test:
	npm test

lint:
	npx eslint .

.PHONY: test