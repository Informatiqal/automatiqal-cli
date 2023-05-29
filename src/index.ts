import { existsSync } from "fs";
import { minimist } from "@p-mcgowan/minimist";
import fetch from "node-fetch";

import { AutomatiqalCLI } from "./lib/CLI";
import { printHelp } from "./lib/help";
import { generateSample } from "./lib/sample";
import { Logger } from "./lib/Logger";

import { IArguments } from "./lib/interfaces";

(async function () {
  const argv: IArguments = minimist(process.argv.slice(2));
  const logger = Logger.getInstance(argv.r || argv.result);
  checkArguments(argv, logger);

  if (process.argv.length == 2) printHelp();
  if (argv.help || argv.h) printHelp();
  if (argv.sample || argv.s) generateSample(argv.sample || argv.s);

  // file argument not provided
  if (!argv.file && !argv.f) {
    logger.error(undefined, 1001);
  }

  // variables file argument is provided but the file is not found
  if (argv.v || argv.var || argv.variables) {
    if (!existsSync(argv.v || argv.var || argv.variables))
      logger.error("", 1011);
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
        logger.error(e.message, 1013);
      });
  }

  const runner = new AutomatiqalCLI(argv, downloadedRunbook);
  runner
    .run()
    .then((data) => {
      if (!argv.raw) {
        logger.info(`---`);
        const msg = `${new Date().toISOString()}\tFinished`;
        logger.info(msg);

        if (argv.r || argv.result) logger.writeOutput();
      }

      if (argv.raw) printOut(data);

      process.exit(0);
    })
    .catch((e) => {
      logger.error(e.message);
    });
})();

function checkArguments(argv: IArguments, logger: Logger): void {
  const validArguments = [
    "_",
    "file",
    "f",
    "json",
    "output",
    "o",
    "sample",
    "s",
    "help",
    "h",
    "variables",
    "var",
    "v",
    "connect",
    "c",
    "global",
    "g",
    "env",
    "e",
    "inline",
    "i",
    "result",
    "r",
    "raw",
  ];

  const unknownArguments = Object.keys(argv).filter(
    (a) => !validArguments.includes(a)
  );

  if (unknownArguments.length > 0)
    logger.error(`Unknown argument(s): \n${unknownArguments.join("\n")}`);
}

function printOut(data) {
  try {
    console.log(JSON.stringify(data, null, 4));
  } catch (e) {
    // logger.error(e.message, 1005);
  }
}
