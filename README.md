# Automatiqal CLI

`Automatiqal CLI` is a `NodeJS` wrapper around [Automatiqal](https://github.com/informatiqal/automatiqal) package that allows automating `Qlik` administration/deployment tasks by describing them im `yaml`/`json` file

As the name suggests `Automatiqal CLI` is a command line/terminal tool

## Installation

Install as global module:
`npm install -g automatiqal-cli`

## Usage

- All available commands can be displayed at any time by running `automatiqal` with the `--help` flag

  `$ automatiqal --help`

  ```
  ...
  --file              Location of the file, containing the run book data
  --variables, -v     Location of the variable file (if needed)
  --json              Indicates that the run book file is in JSON format
  --output,    -o     Saves the result in the provided path
  --sample,    -s     Generate sample run book file in the current folder
  --help,      -h     Shows this message
  ...
  ```

- `--file` - pass the location of the `yaml` file
  `$ automatiqal --file path/to/deployment/file.yaml`

- `--json` - if the file is not in `yaml` but in `json` format then `--json` flag should be added as an extra parameter
  `$ automatiqal --file path/to/deployment/file.json --json`

- `--output` - to save the result of the run book in a json file
  `$ automatiqal --file path/to/deployment/file.yaml --output path/to/result.json`

- `--sample` - generate sample `yaml` file in the current folder
  `$ automatiqal --sample`
