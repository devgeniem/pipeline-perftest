# Pipeline Performace Tester
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)
This is a work in progress tool to run phantomas tests in CI with controllable targets and criteria for passing.

##Dependencies
- node (developed on 4.2.3)
- phantomas module

## Installing
```
npm install
```

## Configuration
Configuring the tests is done using the following JSON files:
```
target_urls.json
```
Should contain an array holding the (full) URLs to run the tests against.

```
limits_default.json
```
Holds all testable variables with sensible *(TODO)* default values. The results for phantomas tests must be equal or less than the tresholds specified to pass.

```
limits_override.json
```
Writing limit-keys to this file overrides any specified in `limits_default`. This is intended for project-specific settings.

## Running
```
node pipeline-perftest
```
