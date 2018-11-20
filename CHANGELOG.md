# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2018-11-20
### Changed
- Added two optional parameters to withRequest options:
  - resetErrorOnResponse (default true): null the error state when a response
    is successfully received
  - resetResponseOnError (default false): set the response to defaultResponse
    when an error is received

## [1.0.1] - 2018-11-15
### Changed
- Use CancellablePromise to cancel overlapping promises instead of the flawed AbortablePromise

## [1.0.0] - 2018-11-13
### Added
- Initial commit
