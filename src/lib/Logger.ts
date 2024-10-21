import { writeFileSync } from "fs";

export class Logger {
  static instance: Logger;
  private saveOutput: string;
  private summaryPath: string;
  messages: string[] = [];
  private errors = {
    1000: "While reading the runbook file",
    1001: "Please provide file location",
    1003: "While parsing the yaml file",
    1004: "While parsing the json file",
    1005: "While writing the output file",
    1006: "Reding certificates",
    1007: `Reading file failed in task`,
    1012: "Variable(s) declaration found but no variables file was provided",
    1011: "Variable(s) file not found",
    1013: "While reading the runbook file",
    1014: "Variable(s) value not found",
    9999: "INTERNAL ERROR",
  };
  constructor(summaryPath: string) {
    this.summaryPath = summaryPath;
  }

  public static getInstance(summaryPath: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(summaryPath);
    }
    return Logger.instance;
  }

  error(message: string, errorId?: number) {
    if (errorId) {
      const genericError = `\u274C ERROR: ${this.errors[errorId]}`;
      console.log(genericError);
      this.messages.push(genericError);
    }

    if (message) {
      console.log(message);
      this.messages.push(message);
    }

    if (this.summaryPath)
      writeFileSync(this.summaryPath, this.messages.join("\n"));

    process.exit(1);
  }

  debug() {}

  info(message: string) {
    console.log(message);
    this.messages.push(message);
  }

  taskEntry(
    startTime: string,
    endTime: string,
    duration: string,
    taskName: string,
    entities: string,
    status: string,
    skipReason: string
  ) {
    const message = [];
    message.push(taskName.padEnd(30, " "));
    message.push(startTime);
    message.push(endTime);
    message.push(duration.padEnd(8, " "));
    message.push(entities.padEnd(10, " "));
    message.push(status.padEnd(20, " "));
    message.push(skipReason);

    this.messages.push(message.join("\t"));
    console.log(message.join("\t"));
  }
}
