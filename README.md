# Automatiqal CLI

`Automatiqal CLI` is a `NodeJS` wrapper around [Automatiqal](https://github.com/informatiqal/automatiqal) package that allows automating `Qlik Sense` administration/deployment tasks by describing them in `yaml`/`json` files.

As the name suggests `Automatiqal CLI` is a command line/terminal tool.

## Installation

Install as global module:
`npm install -g automatiqal-cli`

## Usage

- All available commands can be displayed at any time by running `automatiqal` with the `--help` flag or running it without any flag:

  `$ automatiqal --help`
  `$ automatiqal`

  ```
  --file       -f     Location of the file, containing the run book data
  --variables, -v     Location of the variable file (if needed)
  --json              Indicates that the run book file is in JSON format
  --output,    -o     Saves the result in the provided path
  --sample,    -s     Generate sample run book and variables files in the current folder
  --help,      -h     Shows this message
  ```

- `--file` - pass the location of the `yaml` file
  `$ automatiqal --file path/to/deployment/file.yaml`

- `--variables` - pass the location of the variables file
  `$ automatiqal --file path/to/deployment/file.yaml --variables path/to/deployment/variables-file.yaml`

- `--json` - if the source file is in `json` format then `--json` flag should be added as an extra parameter
  `$ automatiqal --file path/to/deployment/file.json --json`

- `--output` - to save the result of the run book in a json file
  `$ automatiqal --file path/to/deployment/file.yaml --output path/to/result.json`

- `--sample` - generate sample `yaml` file in the current folder
  `$ automatiqal --sample`

## Examples

Have a look at the [examples folder](https://github.com/Informatiqal/automatiqal-cli/tree/main/runbook-examples) for list of example `yaml` files (btw these runbooks are used to test `Automatiqal CLI` itself)

## Documentation

Have a look at `Automatiqal` package [wiki pages](https://github.com/Informatiqal/automatiqal/wiki) on how to structure the file and list of operations. More information will be added soon here as well
