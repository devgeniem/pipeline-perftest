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
tresholds_default.json
```
Holds all testable parameters with sensible *(TODO)* default values. 

Field `tresholds` which contains an object with testable fields and values.
The results for phantomas tests must be equal or less than the tresholds specified to pass. Any field with `-1` in value is considered ignored.

Field `advancedTests` is an array that contains more refined test cases. Tests are defined as objects with following fields:
- name
- method (currently supported: `eq`, `nop`)
- param1
- param2
The behaviour depends on the method field of the test case. Test for `eq` tests that `param1` and `param2` in the result are equal. 
Expect more test methods in the future.

```
tresholds_override.json
```
Writing treshold-keys to this file overrides any specified in `tresholds_default`. 
`advancedTests`-array will override any default test method with the same name, or add a new one.
This is intended for project-specific settings.

## Running
```
node pipeline-perftest
```
Exit code is 0 for passed tests, 1 for failed.

Explanations for the failures are listed in the page for [Phantomas](https://github.com/macbre/phantomas)
