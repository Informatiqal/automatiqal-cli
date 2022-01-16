import { readFileSync, writeFileSync } from "fs";
import yaml from "js-yaml";
import { Automatiqal } from "../../../automatiqal/src/index";

import { IRunBook } from "../../../automatiqal/src/RunBook/RunBook.interfaces";
import { IRunBookResult } from "../../../automatiqal/src/RunBook/Runner";

import { IArguments } from "./interfaces";

export class AutomatiqalCLI {
  private argv: IArguments;
  private runBook: IRunBook;
  private result: IRunBookResult[];
  constructor(argv: IArguments) {
    this.argv = argv;

    if (!this.argv.json) {
      try {
        this.runBook = yaml.load(readFileSync(this.argv.file, "utf8"));
      } catch (e) {
        console.log(`\u274C ERROR 1003: while parsing the yaml file`);
        console.log(e.message);
        process.exit(1);
      }
    }

    if (this.argv.json) {
      try {
        this.runBook = JSON.parse(readFileSync(this.argv.file).toString());
      } catch (e) {
        // console.log(`\u274C ERROR 1004: while parsing the json file`);
        // console.log(e.message);
        // process.exit(1);
      }
    }
  }

  async run() {
    const automatiqal = new Automatiqal(this.runBook);
    this.result = await automatiqal.run();
    if (this.argv.output || this.argv.o) this.writeOut();
  }

  private writeOut() {
    try {
      writeFileSync(this.argv.output, JSON.stringify(this.result, null, 4));
    } catch (e) {
      console.log(`\u274C ERROR 1005: while writing the output file:`);
      console.log(e.message);
      process.exit(1);
    }
  }
}
