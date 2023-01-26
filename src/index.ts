import { existsSync } from "fs";
import { minimist } from "@p-mcgowan/minimist";
import fetch from "node-fetch";

import { AutomatiqalCLI } from "./lib/CLI";
import { printHelp } from "./lib/help";
import { generateSample } from "./lib/sample";

import { IArguments } from "./lib/interfaces";

(async function () {
  const argv: IArguments = minimist(process.argv.slice(2));

  if (process.argv.length == 2) printHelp();
  if (argv.help || argv.h) printHelp();
  if (argv.sample || argv.s) generateSample(argv.sample || argv.s);

  // file argument not provided
  if (!argv.file && !argv.f) {
    console.log(`\u274C ERROR 1001: Please provide file location`);
    process.exit(1);
  }

  // variables file argument is provided but the file is not found
  if (argv.v || argv.var || argv.variables) {
    if (!existsSync(argv.v || argv.var || argv.variables)) {
      console.log(
        `\u274C ERROR 1011: Variables file not found: "${
          argv.v || argv.var || argv.variables
        }"`
      );
      process.exit(1);
    }
  }

  let downloadedRunbook: string | undefined = undefined;
  const regex = /(https?:\/\/[^\s]+)/;
  const urlMatching = (argv.file || argv.f).match(regex);
  // if the provided file argument is an url -> download its content
  if (urlMatching) {
    await fetch(argv.file || argv.f)
      .then((res) => res.text())
      .then((text) => {
        downloadedRunbook = text;
      })
      .catch((e) => {
        console.log(`\u274C ERROR 1013: while reading the runbook file`);
        console.log(e.message);
        process.exit(1);
      });
  }

  // TODO: throw an error when unknown argument is passed?
  const runner = new AutomatiqalCLI(argv, downloadedRunbook);
  runner
    .run()
    .then((data) => {
      console.log(`${new Date().toISOString()}\tFinished successfully`);
      process.exit(0);
    })
    .catch((e) => {
      // console.log(`\u274C ERROR 9999: UNEXPECTED error!`);
      console.log(`${new Date().toISOString()}\t\t\tFinished with ERROR(s)`);
      console.log(e.message);
      process.exit(1);
    });
})();
