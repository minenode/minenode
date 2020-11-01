.PHONY: build clean
default: build

TSC=./node_modules/.bin/tsc

build:
	$(TSC)

clean:
	rm -rfv ./dist/
