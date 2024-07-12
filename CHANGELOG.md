# Changelog

## [0.10.1] - 2024-07-12

- `--disableValidation, -d` - skip schema validation option. Useful in small amount of cases
- dependency updates

## [0.10.0] - 2024-06-06

- new argument `--listvars`/`l`. When provided the CLI will just output the list of variables that are defined/expected in the runbook

## [0.9.0] - 2024-06-06

- handle `app.uploadMany` case, where only `location` is passed and have to converted to list of files
- dependency updates

## [0.8.0] - 2024-06-03

- new `summary`/`s` argument. When provided will store the summary output to the provided path (file)  [#246](https://github.com/Informatiqal/automatiqal-cli/issues/246)
- dependency updates

## [0.7.9] - 2024-05-31

- clean the runbook content from any commented and empty lines before processing it [#245](https://github.com/Informatiqal/automatiqal-cli/issues/245)
- dependency updates

## [0.7.8] - 2024-05-29

- dependency updates

## [0.7.7] - 2024-05-27

- dependency updates

## [0.7.6] - 2024-02-25

- dependency updates

- handle binary data masking for SaaS operations in the output

## [0.7.4] - 2023-09-04

- dependency updates
- started testing with SaaS based runbooks
- small fixes related to SaaS runbooks
- `--sample` command is no split into two commands: `--sample-win` and `--sample-saas`

## [0.7.3] - 2023-06-07

- when uploading files use `createReadStream` instead of `readFileSync`. This should lower the resource usage when dealing with large files

## [0.7.2] - 2023-06-05

- If the export data have `path` property (ex. content libraries) then the same folder structure will be created [#205](https://github.com/Informatiqal/automatiqal-cli/issues/205)

## [0.7.1] - 2023-06-04

- binary data for multiple exports (ex `contentLibrary.exportMany`) is replaced with placeholder message (in output)
- dependency updates

## [0.6.9] - 2023-06-01

- binary data replace with placeholder message (in output) [#143](https://github.com/Informatiqal/automatiqal-cli/issues/143)

## [0.6.8] - 2023-05-29

- raw output [#198](https://github.com/Informatiqal/automatiqal-cli/issues/198). If `raw` argument is provided then all other console messages are suppressed

## [0.6.7] - 2023-05-22

- updated console output format
- dependency updates

## [0.6.4] - 2023-03-16

- dependency updates

## [0.6.2] - 2023-03-04

- core dependency updates

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
