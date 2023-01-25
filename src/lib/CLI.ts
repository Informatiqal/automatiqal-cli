import { readFileSync, writeFileSync } from "fs";
import { Agent } from "https";
import { homedir } from "os";
import { load as yamlLoad } from "js-yaml";
import { Automatiqal } from "automatiqal";
import { varLoader } from "@informatiqal/variables-loader";

import { IRunBook } from "automatiqal/dist/RunBook/RunBook.interfaces";
import { ITaskResult } from "automatiqal/dist/RunBook/Runner";

import { IArguments } from "./interfaces";

export class AutomatiqalCLI {
  private argv: IArguments;
  private runBook: IRunBook;
  private result: ITaskResult[];
  private httpsAgent: any;
  private automatiqal: Automatiqal;
  private rawRunBook: string;
  private variables: { [k: string]: any };
  private runbookVariablesList: RegExpMatchArray;
  private variablesValues: { [x: string]: string };

  constructor(argv: IArguments) {
    this.argv = argv;
    this.result = [];
    this.variables = {};

    try {
      this.rawRunBook = readFileSync(
        this.argv.file || this.argv.f,
        "utf8"
      ).toString();
    } catch (e) {
      console.log(`\u274C ERROR 1000: while reading the runbook file`);
      console.log(e.message);
      process.exit(1);
    }

    // match all strings in between ${ and }
    this.runbookVariablesList = this.rawRunBook.match(/(?<=\${)(.*?)(?=})/g);

    if (
      this.runbookVariablesList &&
      this.runbookVariablesList.length > 0 &&
      !this.argv.v &&
      !this.argv.variables &&
      !this.argv.var &&
      !this.argv.g &&
      !this.argv.global &&
      !this.argv.e &&
      !this.argv.env &&
      !this.argv.i &&
      !this.argv.inline
    ) {
      console.log(
        `\u274C ERROR 1012: Variable(s) declaration found but no variables file was provided`
      );
      console.log("");
      console.log("Variables found:");
      this.runbookVariablesList.forEach((v) => console.log(`  ${v}`));
      process.exit(1);
    }

    // global variables should be read before the variables file
    // variables file have priority over the global variables
    // if (this.argv.g || this.argv.global) this.readGlobalVariables();

    const variablesData = varLoader({
      sources: {
        environment: this.argv.e || this.argv.env,
        file: this.argv.v || this.argv.var || this.argv.variables,
        global:
          this.argv.g || this.argv.global
            ? `${homedir()}/.automatiqal`
            : undefined,
        inline: this.argv.i || this.argv.inline,
      },
      variables: Array.from(this.runbookVariablesList),
    });

    if (variablesData.missing) {
      console.log(`\u274C ERROR 1014: Variable(s) value not found`);
      variablesData.missing.forEach((v) => console.log(`  - ${v}`));
      process.exit(1);
    }

    this.variablesValues = variablesData.values;

    // TODO: simplify this maybe?
    if (
      this.argv.var ||
      this.argv.v ||
      this.argv.variables ||
      this.argv.v ||
      this.argv.variables ||
      this.argv.var ||
      this.argv.g ||
      this.argv.global ||
      this.argv.e ||
      this.argv.env ||
      this.argv.i ||
      this.argv.inline
    )
      this.replaceVariables();

    this.runbookSet();

    if ((this.runBook.environment.authentication as any).cert) {
      this.prepareCertificates();
    } else {
      this.httpsAgent = new Agent({
        rejectUnauthorized: false,
      });
    }

    // no need to read any files if only connection is being tested
    if (!this.argv.c && !this.argv.connect) this.readBuffers();

    try {
      this.automatiqal = new Automatiqal(this.runBook, this.httpsAgent);
    } catch (e) {
      if (e.context) {
        console.log(e.context);
        process.exit(1);
      }

      if (e.message) {
        console.log(e.message);
        process.exit(1);
      }
    }

    this.emittersSet();
  }

  async run() {
    console.log(
      `${new Date().toISOString()}\t\t"${this.runBook.name}"\tStarted`
    );

    await this.automatiqal.run();

    if (this.argv.output || this.argv.o) this.writeOut();

    return this.result;
  }

  /**
   * @description set the runbook based on the provided yaml/json file
   */
  private runbookSet() {
    // if the config is yaml
    if (!this.argv.json) {
      try {
        this.runBook = yamlLoad(this.rawRunBook) as IRunBook;
      } catch (e) {
        console.log(`\u274C ERROR 1003: while parsing the yaml file`);
        console.log(e.message);
        process.exit(1);
      }
    }

    // if the config is json
    if (this.argv.json) {
      try {
        this.runBook = JSON.parse(this.rawRunBook);
      } catch (e) {
        console.log(`\u274C ERROR 1004: while parsing the json file`);
        console.log(e.message);
        process.exit(1);
      }
    }

    if (this.argv.c || this.argv.connect) {
      this.runBook.tasks = [
        { name: "Test connectivity", operation: "about.get" },
      ];
    }
  }

  /**
   * @description create all required emitters
   */
  private emittersSet() {
    const _this = this;
    this.automatiqal.emitter.on("task:result", async function (a) {
      const b: ITaskResult = a as any;

      if (b.task.operation.indexOf(".export") > -1) {
        if (!b.task.location) {
          console.log(
            `\u274C ERROR 1009: "${b.task.name}" is missing "location" parameter`
          );
          process.exit(1);
        }
        try {
          _this.writeExports(
            Array.isArray(b.data) ? b.data : [b.data],
            b.task.location
          );

          if (Array.isArray(b.data)) {
            if (b.data && b.data.length > 0) {
              b.data = b.data.map((r: any) => {
                if (r.file) r.file = "BINARY CONTENT REPLACED!";
                return r;
              });
            }
          }
        } catch (e) {
          console.log(
            `\u274C ERROR 1010: Error in "${b.task.name}". Failed to write file: "${e.path}" `
          );
          process.exit(1);
        }
      }

      _this.result.push(b);

      console.log(
        `${b.timings.start}\t${b.timings.end}\t${b.timings.totalSeconds}(s)\t"${b.task.name}"\t${b.status}`
      );
    });

    this.automatiqal.emitter.on("runbook:result", function (r) {});

    this.automatiqal.emitter.on("runbook:log", function (l) {});

    this.automatiqal.emitter.on("error", function (errorMessage) {
      console.log(errorMessage);
      // process.exit(1);
    });
  }

  /**
   * @description if "output" flag is present - write the result to a file
   */
  private writeOut() {
    try {
      writeFileSync(
        this.argv.output || this.argv.o,
        JSON.stringify(this.result, null, 4)
      );
    } catch (e) {
      console.log(`\u274C ERROR 1005: while writing the output file`);
      console.log(e.message);
      process.exit(1);
    }
  }

  /**
   * @description if the authentication is certificates based
   *     read the certificates and prepare the httpsAgent
   */
  private prepareCertificates() {
    {
      let cert: Buffer;
      let key: Buffer;

      try {
        cert = readFileSync(
          (this.runBook.environment.authentication as any).cert
        );
        key = readFileSync(
          (this.runBook.environment.authentication as any).key
        );
      } catch (e) {
        console.log(`\u274C ERROR 1006: reding certificates`);
        console.log(e.message);
        process.exit(1);
      }

      this.httpsAgent = new Agent({
        rejectUnauthorized: false,
        cert: cert,
        key: key,
      });
    }
  }

  /**
   * @description loop through all the tasks and replace the file location
   *     (if any) with the actual file content
   */
  private readBuffers() {
    for (let task of this.runBook.tasks) {
      if (task.details && (task.details as any).file) {
        try {
          (task.details as any).file = readFileSync((task.details as any).file);
        } catch (e) {
          console.log(
            `\u274C ERROR 1007: reading file failed in task "${task.name}"`
          );
          console.log(e.message);
          process.exit(1);
        }
      }

      if (task.details && (task.details as any).length > 0) {
        task.details = (task.details as any).map((d) => {
          if (d.file) {
            try {
              d.file = readFileSync(d.file);
              return d;
            } catch (e) {
              console.log(
                `\u274C ERROR 1007: reading file failed in task "${task.name}"`
              );
              console.log(e.message);
              process.exit(1);
            }
          }

          return d;
        });
      }
    }
  }

  /**
   * @description replace all runbook variables with their content
   */
  private replaceVariables() {
    Object.entries(this.variablesValues).forEach(([varName, varValue]) => {
      try {
        const v = "\\$\\{" + varName + "\\}";
        const re = new RegExp(v, "g");

        this.rawRunBook = this.rawRunBook.replace(re, varValue.toString());
      } catch (e) {
        console.log(`\u274C INTERNAL ERROR: ${e.message}`);
        process.exit(1);
      }
    });
  }

  private writeExports(files: any[], location: string) {
    if (!Array.isArray(files)) {
      writeFileSync(`${location}\\${(files as any).name}`, (files as any).file);

      return true;
    }

    files.map((f) => {
      if (Array.isArray(f)) {
        f.map((f1) =>
          writeFileSync(`${location}\\${(f1 as any).name}`, (f1 as any).file)
        );

        return true;
      }

      writeFileSync(`${location}\\${(f as any).name}`, (f as any).file);
    });

    return true;
  }
}
