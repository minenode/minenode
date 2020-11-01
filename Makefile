.PHONY: build configure test clean
default: build

TSC=./node_modules/.bin/tsc
ESLINT=./node_modules/.bin/eslint

build: configure test clean
	$(TSC)

configure:
	yarn --silent

test: configure
	$(ESLINT) --ext ts src
	$(TSC) --noEmit

clean:
	rm -rfv ./dist/*
