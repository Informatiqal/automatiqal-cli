# Changelog

## [0.6.1] - 2023-03-04

- do not flag the inline variables as missing variables

## [0.6.0] - 2023-02-12

- flag to store the run output in a file [#99](https://github.com/Informatiqal/automatiqal-cli/issues/99)
- throw an error if unknown argument(s) are passed

## [0.5.2] - 2023-02-10

- fix issue with the post install script

## [0.5.1] - 2023-02-10

- do not flag the special values as missing

## [0.5.0] - 2023-01-26

- ability to download the runbook from http(s)
- help command updated

## [0.4.0] - 2023-01-25

- environment and inline/command variables flags

## [0.3.0] - 2023-01-14

- warning is printed for unused variables

## [0.2.0] - 2023-01-13

- global variables flag

## [0.1.1] - 2022-12-27

- dependency updates
- required NodeJS version >= 16.0.0

## [0.1.0] - 2022-12-23

- the schema link added to all examples
- schema link added to the sample generated files
- various bug fixes
- dependencies are updated

## [0.0.14] - 2022-03-29

- [fix] Tasks for `XXX.export` commands no longer output the content of the binary, if `--output` argument is specified [#21](https://github.com/Informatiqal/automatiqal-cli/issues/21)

## [0.0.13] - 2022-03-23

- dependency updates

## [0.0.12] - 2022-03-22

- [add] `-c`/`--connect` arguments to test runbook connectivity [#19](https://github.com/Informatiqal/automatiqal-cli/issues/19)
- [add] initial check - variable(s) are defined in the runbook but no variables file is passed [#20](https://github.com/Informatiqal/automatiqal-cli/issues/20)
- [add] because of [#19](https://github.com/Informatiqal/automatiqal-cli/issues/19) no files will be read if connection is testing (certificates are exclusion)
- [fix] colors in the help menu

## [0.0.11] - 2022-03-21

- [fix] check for `-f` argument file existence. At the moment only `--file` was checked

## [0.0.10] - 2022-03-08

- [fix] do not exit on error thrown. The task that throw the error might have `onError` block that should be executed

## [0.0.9] - 2022-03-02

- [fix] import dependencies - import from the package and not from the local location

## [0.0.8] - 2022-02-24

- dependency and readme update

## [0.0.7] - 2022-02-16

- [add] `-f` is added as alternative to `--file`
- [fix] sample and sample variable are updated to reflect the latest changes in the structure
- [change] moved the non-yaml example files to `assets` folder
- [change] the help info is shown if no arguments are passed
- [change] the help message is updated

## [0.0.6] - 2022-02-15

- more examples
- handling the `export` and `exportMany` operations and saving the file(s)
- new task property `location`. Used with the export ops to point where to save the files

## [0.0.5] - 2022-02-10

- [add] small print/console messages changes
- [add] more examples added (`runbook-examples` folder). More will follow

## [0.0.4] - 2022-02-03

- [add] variables file is supported
- [add] runbook examples folder added
- [add] using tests to run the runbook examples
- [add] more debug options
- [add] more error handling
- [fix] various small fixes
