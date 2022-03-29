const pkg = { version: "0.0.14" };

export function printHelp() {
  const messages = [
    "",
    `Automatiqal CLI\x1b[32;1m v${pkg.version}\x1b[0m`,
    "",
    "Usage: automatiqal [options]",
    "",
    "Options:",
    "--file,      -f     Location of the file, containing the run book data",
    "--variables, -v     Location of the variable file (if needed)",
    "--json              Indicates that the run book file is in JSON format",
    "--output,    -o     Saves the result in the provided path",
    "--connect,   -c     Test the connectivity. No tasks are ran",
    "--sample,    -s     Generate sample run book and variables files in the current folder",
    "--help,      -h     Shows this message",
    "",
    "Examples:",
    "$ automatiqal --file ./deployment.yaml",
    "$ automatiqal --file ./deployment.yaml --variables ./runbook-variables.yaml",
    "$ automatiqal --file ./deployment.json --json",
    "$ automatiqal --file ./deployment.yaml --output ./deployment_result.json",
    "",
    "\x1b[33;1mIf you find Automatiqal CLI useful, please consider sponsoring the project:",
    "https://github.com/informatiqal/automatiqal-cli\x1b[0m",
    "",
  ];

  messages.forEach((message) => {
    console.log(message);
  });
}
