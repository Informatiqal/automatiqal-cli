import { readFileSync, writeFileSync } from "fs";
import yaml from "js-yaml";

import { IArguments } from "./interfaces";

export class AutomatiqalCLI {
  private argv: IArguments;
  private runBook: any;
  private result: any;
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
    this.result = { whatever: 123 };
    if (this.argv.output) this.writeOut();
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
