.PHONY: build configure clean
default: build

TSC=./node_modules/.bin/tsc

build: configure clean
	$(TSC)

configure:
	yarn --silent

clean:
	rm -rf ./dist/*
