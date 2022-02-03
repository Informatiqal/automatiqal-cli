import { existsSync } from "fs";
import { minimist } from "@p-mcgowan/minimist";

import { AutomatiqalCLI } from "./lib/CLI";
import { printHelp } from "./lib/help";
import { generateSample } from "./lib/sample";

import { IArguments } from "./lib/interfaces";

const argv: IArguments = minimist(process.argv.slice(2));

if (argv.help || argv.h) {
  printHelp();
  process.exit(0);
}

if (argv.sample || argv.s) {
  generateSample(argv.sample || argv.s);
  console.log(`\u2705 "automatiqalCLI-sample.yaml" generated`);
  console.log(`\u2705 "automatiqalCLI.variables.yaml" generated`);
  process.exit(0);
}

// file argument not provided
if (!argv.file) {
  console.log(`\u274C ERROR 1001: Please provide file location`);
  process.exit(1);
}

// file argument provided but the file do not exists
if (!existsSync(argv.file)) {
  console.log(`\u274C ERROR 1002: File not found: "${argv.file}"`);
  process.exit(1);
}

// TODO: throw an error when unknown argument is passed

const runner = new AutomatiqalCLI(argv);
runner
  .run()
  .then((data) => {
    console.log(`\u2705 Completed!`);
    process.exit(0);
  })
  .catch((e) => {
    // console.log(`\u274C ERROR 9999: UNEXPECTED error!`);
    console.log(e.message);
    process.exit(1);
  });
