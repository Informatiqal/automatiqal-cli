import { existsSync, readFileSync, writeFileSync } from "fs";
import { Agent } from "https";
import { homedir } from "os";
import { load as yamlLoad } from "js-yaml";
import { Automatiqal } from "automatiqal";
import { varLoader } from "@informatiqal/variables-loader";

import { IRunBook } from "automatiqal/dist/RunBook/RunBook.interfaces";
import { ITaskResult } from "automatiqal/dist/RunBook/Runner";
import { Logger } from "./Logger";

import { IArguments } from "./interfaces";

export class AutomatiqalCLI {
  private argv: IArguments;
  private runBook: IRunBook;
  private logger: Logger;
  private result: ITaskResult[];
  private httpsAgent: any;
  private automatiqal: Automatiqal;
  private rawRunBook: string;
  private runbookVariablesList: string[];
  private variablesValues: { [x: string]: string };
  private emitterMessages: string[];
  private specialVariables = [
    "GUID",
    "TODAY",
    "NOW",
    "INCREMENT",
    "DECREMENT",
    "RANDOM",
  ];

  constructor(argv: IArguments, downloadedRunbook) {
    this.argv = argv;
    this.result = [];
    this.rawRunBook = downloadedRunbook;
    this.logger = Logger.getInstance(this.argv.r || this.argv.result);

    // if the runbook was not an url
    // try and read the file
    if (!this.rawRunBook) {
      try {
        this.rawRunBook = readFileSync(
          this.argv.file || this.argv.f,
          "utf8"
        ).toString();
      } catch (e) {
        this.logger.error(e.message, 1000);
      }
    }

    // match all strings in between ${ and }
    // and exclude $${...} ones
    this.runbookVariablesList = this.rawRunBook
      .match(/(?<!\$)(\${)(.*?)(?=})/g)
      .map((v) => v.substring(2));

    // TODO: simplify this maybe?
    // Check if there are variables in the runbook
    // but no variables sources was provided
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
      this.logger.error(
        `\nVariables found:\n${this.runbookVariablesList
          .map((v) => `  ${v}`)
          .join("\n")}`,
        1012
      );
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
      ignore: this.specialVariables,
    });

    if (variablesData.missing)
      this.logger.error(
        variablesData.missing.map((v) => `  - ${v}`).join("\n"),
        1014
      );

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
      if (e.context) this.logger.error(e.context);
      if (e.message) this.logger.error(e.message);
    }

    this.emittersSet();
  }

  async run() {
    if (!this.argv.raw) this.printRunbookDetails();

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
        this.logger.error(e.message, 1003);
      }
    }

    // if the config is json
    if (this.argv.json) {
      try {
        this.runBook = JSON.parse(this.rawRunBook);
      } catch (e) {
        this.logger.error(e.message, 1003);
      }
    }

    this.checkExportPaths(this.runBook.tasks);

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

      if (b.task.details.hasOwnProperty("file"))
        (b.task.details as any).file = "<BINARY CONTENT>";

      if (b.task.operation.indexOf(".export") > -1) {
        // TODO: is this needed? The schema validation should prevent this already?
        // if ((!b.task.details as any).location) {
        //   _this.logger.error(
        //     `ERROR: "${b.task.name}" is missing "location" parameter`
        //   );
        // }
        try {
          _this.writeExports(
            Array.isArray(b.data) ? b.data : [b.data],
            (b.task.details as any).location
          );

          if (Array.isArray(b.data)) {
            if (b.data && b.data.length > 0) {
              b.data = b.data.map((r: any) => {
                if (r.file) r.file = "<BINARY CONTENT>";
                return r;
              });
            }
          }
        } catch (e) {
          _this.logger.error(
            `Error in "${b.task.name}". Failed to write file: "${e.path}"`
          );
        }
      }

      _this.result.push(b);

      if (!_this.argv.raw)
        _this.logger.taskEntry(
          b.timings.start,
          b.timings.end,
          `${b.timings.totalSeconds}(s)`,
          b.task.name,
          b.status
        );
      // _this.logger.info(
      //   `${b.timings.start}\t${b.timings.end}\t${b.timings.totalSeconds}(s)\t"${b.task.name}"\t${b.status}`
      // );
    });

    this.automatiqal.emitter.on("runbook:result", function (r) {});

    this.automatiqal.emitter.on("runbook:log", function (l) {});

    this.automatiqal.emitter.on("error", function (errorMessage) {
      console.log(errorMessage);
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
      this.logger.error(e.message, 1005);
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
        this.logger.error(e.message, 1006);
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
          this.logger.error(e.message, 1007);
        }
      }

      if (task.details && (task.details as any).length > 0) {
        task.details = (task.details as any).map((d) => {
          if (d.file) {
            try {
              d.file = readFileSync(d.file);
              return d;
            } catch (e) {
              this.logger.error(e.message, 1007);
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
        this.logger.error(e.message, 9999);
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

  private printRunbookDetails() {
    this.logger.info(`CLI Version   : __VERSION`);
    this.logger.info(`Runbook file  : ${this.argv.file || this.argv.f}`);
    if (this.argv.v || this.argv.var || this.argv.variables)
      this.logger.info(
        `Variables file: ${this.argv.v || this.argv.var || this.argv.variables}`
      );
    this.logger.info(`Runbook name  : ${this.runBook.name}`);
    if (this.runBook.description)
      this.logger.info(`Description: ${this.runBook.description}`);
    this.logger.info(`Start time    : ${new Date().toISOString()}`);
    this.logger.info(`---`);

    this.logger.taskEntry(
      "START TIME".padEnd(24, " "),
      "END TIME".padEnd(24, " "),
      "DURATION",
      "TASK NAME".padEnd(30, " "),
      "STATUS"
    );
  }

  private checkExportPaths(tasks: any) {
    let nonExistingPaths = [];

    tasks.forEach((task) => {
      if (task.details?.location) {
        const isValidPath = existsSync(task.details?.location);

        if (!isValidPath)
          nonExistingPaths.push(
            `Initial check: Export path for task "${task.name}" do not exists "${task.details.location}"`
          );
      }
    });

    if (nonExistingPaths.length > 0)
      this.logger.error(nonExistingPaths.join("\n"));
  }
}
