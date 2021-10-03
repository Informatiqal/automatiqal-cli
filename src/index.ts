import { existsSync } from "fs";
import { minimist } from "@p-mcgowan/minimist";
import { AutomatiqalCLI } from "./lib/AutomatiqalCLI";
// import { Automatiqal } from "../../automatiqal/src/index";

import { IArguments } from "./lib/interfaces";

const argv: IArguments = minimist(process.argv.slice(2));

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

const runner = new AutomatiqalCLI(argv);
runner
  .run()
  .then((data) => {
    console.log(`\u2705 Completed!`);
  })
  .catch((e) => {
    console.log(`\u274C ERROR 9999: UNEXPECTED error!`);
    console.log(e.message);
    process.exit(1);
  });
