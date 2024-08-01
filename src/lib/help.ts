const pkg = { version: "__VERSION" };

export function printHelp() {
  const messages = [
    "",
    `Automatiqal CLI\x1b[32;1m v${pkg.version}\x1b[0m`,
    "",
    "Usage: automatiqal [options]",
    "",
    "Options:",
    "--file,        -f     Location of the file, containing the run book data",
    "--variables,   -v     Location of the variable file (if needed)",
    "--global,      -g     Use global variable file as source of variables values ($HOME/.automatiqal)",
    "--env,         -e     Use environment variables as source of variables values",
    "--inline,      -i     Provide inline/command variables values",
    "--listvars     -l     List the defined variables in the runbook. Runbook itself is not ran",
    "--compile,            Loads all imports into the runbook and output or saves the result to the provided location",
    "--json                Indicates that the run book file is in JSON format",
    "--output,      -o     Saves the result in the provided path",
    "--raw                 Print the result in the console. All other console messages are suppressed",
    "--summary,     -s     Saves the summary to a file",
    "--connect,     -c     Test the connectivity. No tasks are ran",
    "--sample-win,  -sw    Generate sample run book and variables files in the current folder for QSEoW",
    "--sample-saas, -ss    Generate sample run book and variables files in the current folder for Qlik Cloud/SaaS",
    "--help,        -h     Shows this message",
    "",
    "Examples:",
    "$ automatiqal --file ./deployment.yaml",
    "$ automatiqal --file ./deployment.yaml --variables ./runbook-variables.yaml",
    "$ automatiqal --file ./deployment.json --json",
    "$ automatiqal --file ./deployment.yaml --output ./deployment_result.json",
    "$ automatiqal --file ./deployment.yaml --summary ./summary.txt",
    "$ automatiqal --file http://something.com/deployment.yaml --output ./deployment_result.json",
    `$ automatiqal --file ./deployment.yaml --inline "my-variable=value123; another-variable = 456"`,
    `$ automatiqal --file ./deployment.yaml --compile ./deployment-compiled.yaml"`,
    "",
    "\x1b[33;1mFor more info please check https://docs.informatiqal.com/automatiqal-cli/\x1b[0m",
    "",
    "\x1b[33;1mIf you find Automatiqal CLI useful, please consider sponsoring the project:",
    "https://github.com/informatiqal/automatiqal-cli\x1b[0m",
    "",
  ];

  messages.forEach((message) => {
    console.log(message);
  });

  process.exit(0);
}
