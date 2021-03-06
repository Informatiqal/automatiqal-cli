# Changelog

## [0.0.14] - 2022-03-29

### Fixed

- Tasks for `XXX.export` commands no longer output the content of the binary, if `--output` argument is specified [#21](https://github.com/Informatiqal/automatiqal-cli/issues/21)

## [0.0.13] - 2022-03-23

### Fixed

- Dependency updates

## [0.0.12] - 2022-03-22

### Added

- `-c`/`--connect` arguments to test runbook connectivity [#19](https://github.com/Informatiqal/automatiqal-cli/issues/19)
- initial check - variable(s) are defined in the runbook but no variables file is passed [#20](https://github.com/Informatiqal/automatiqal-cli/issues/20)
- because of [#19](https://github.com/Informatiqal/automatiqal-cli/issues/19) no files will be read if connection is testing (certificates are exclusion)

### Fixed

- colors in the help menu

## [0.0.11] - 2022-03-21

### Fixed

- check for `-f` argument file existence. At the moment only `--file` was checked

## [0.0.10] - 2022-03-08

### Fixed

- do not exit on error thrown. The task that throw the error might have `onError` block that should be executed

## [0.0.9] - 2022-03-02

### Fixed

- import dependencies - import from the package and not from the local location

## [0.0.8] - 2022-02-24

- dependency and readme update

## [0.0.7] - 2022-02-16

### Added

- `-f` is added as alternative to `--file`

### Fixed

- sample and sample variable are updated to reflect the latest changes in the structure

### Changed

- moved the non-yaml example files to `assets` folder
- the help info is shown if no arguments are passed
- the help message is updated

## [0.0.6] - 2022-02-15

- more examples
- handling the `export` and `exportMany` operations and saving the file(s)
- new task property `location`. Used with the export ops to point where to save the files

### Added

## [0.0.5] - 2022-02-10

### Added

- small print/console messages changes
- more examples added (`runbook-examples` folder). More will follow

## [0.0.4] - 2022-02-03

### Added

- variables file is supported
- runbook examples folder added
- using tests to run the runbook examples
- more debug options
- more error handling

### Fixed

- various small fixes
