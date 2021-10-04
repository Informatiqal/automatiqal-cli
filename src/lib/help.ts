const pkg = require("../package.json");

export function printHelp() {
  const messages = [
    "",
    `Automatiqal CLI\x1b[31m v${pkg.version}\x1b[0m`,
    "",
    "Usage: automatiqal [options]",
    "",
    "Options:",
    "--file           Location of the file, containing the run book data",
    "--json           Indicates that the run book file is in JSON format",
    "--output, -o     Saves the result in the provided path",
    "--sample, -s     Generate sample run book file in the current folder",
    "--help,   -h     Shows this message",
    "",
    "Examples:",
    "$ automatiqal --file ./deployment.yaml",
    "$ automatiqal --file ./deployment.json --json",
    "$ automatiqal --file ./deployment.yaml --output ./deployment_result.json",
    "",
    "\x1b[33mIf you find Automatiqal CLI useful, please consider sponsoring the project:",
    "https://github.com/informatiqal/automatiqal-cli\x1b[0m",
    "",
  ];

  for (let message of messages) {
    console.log(message);
  }
}
