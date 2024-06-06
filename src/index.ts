import { existsSync, writeFileSync } from "fs";
import { minimist } from "@p-mcgowan/minimist";
import fetch from "node-fetch";

import { AutomatiqalCLI } from "./lib/CLI";
import { printHelp } from "./lib/help";
import { generateSampleWindows, generateSampleSaaS } from "./lib/sample";
import { Logger } from "./lib/Logger";

import { IArguments } from "./lib/interfaces";
import { ITaskResult } from "automatiqal/dist/RunBook/Runner";

(async function () {
  const argv: IArguments = minimist(process.argv.slice(2));
  const logger = Logger.getInstance();
  checkArguments(argv, logger);

  if (process.argv.length == 2) printHelp();
  if (argv.help || argv.h) printHelp();
  if (argv["sample-win"]) generateSampleWindows(argv["sample-win"]);
  if (argv["sample-saas"]) generateSampleSaaS(argv["sample-saas"]);

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

  let runner: AutomatiqalCLI;

  try {
    runner = new AutomatiqalCLI(argv, downloadedRunbook);
  } catch (e) {
    const message = `Error(s) while initializing! Schema issue?\n\n${e.message}`;
    if (argv.summary || argv.s) writeSummary(message);
    logger.error(message);
  }

  runner
    .run()
    .then((data) => {
      if (!argv.raw) {
        logger.info(`---`);
        const msg = `${new Date().toISOString()}\tFinished`;
        logger.info(msg);

        if (argv.o || argv.output) writeResult(data);
        if (argv.s || argv.summary) writeSummary();
      } else {
        printRawData(data);
      }

      process.exit(0);
    })
    .catch((e) => {
      logger.error(e.message);
    });

  function writeSummary(error?: string) {
    const toWrite = error || logger.messages.join("\n");

    try {
      writeFileSync(argv.s || argv.summary, toWrite);
    } catch (e) {
      logger.error(e.message, 1005);
    }
  }

  function printRawData(data) {
    try {
      console.log(JSON.stringify(data, null, 4));
    } catch (e) {
      logger.error(e.message, 1005);
    }
  }

  function writeResult(data: ITaskResult[]) {
    try {
      writeFileSync(argv.o || argv.output, JSON.stringify(data, null, 4));
    } catch (e) {
      logger.error(e.message, 1005);
    }
  }
})();

function checkArguments(argv: IArguments, logger: Logger): void {
  const validArguments = [
    "_",
    "file",
    "f",
    "json",
    "output",
    "o",
    "sample-win",
    "sample-saas",
    "help",
    "h",
    "variables",
    "var",
    "v",
    "l",
    "listvars",
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
    "summary",
    "s",
  ];

  const unknownArguments = Object.keys(argv).filter(
    (a) => !validArguments.includes(a)
  );

  if (unknownArguments.length > 0)
    logger.error(`Unknown argument(s): \n${unknownArguments.join("\n")}`);
}
