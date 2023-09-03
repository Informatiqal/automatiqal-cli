import { describe, it, expect } from "vitest";
import { spawn } from "child_process";

interface IProcessReturn {
  code: number;
  output?: string[];
}

async function runProcess(args: string[]): Promise<IProcessReturn> {
  return new Promise<IProcessReturn>(function (resolve, reject) {
    const process = spawn("node", ["./dist/index.js", ...args]);
    let output: string = "";

    process.stdout.on("data", function (data) {
      output += data.toString();
    });

    process.stderr.on("error", function (err) {
      reject({ code: err });
    });

    process.on("close", function (code: number) {
      resolve({ code, output: output.split("\n") });
    });
  });
}

describe("Automatiqal Tests", function () {
  it("automatiqalCLI-example-1", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-1.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-2", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-2.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
      "--output",
      "./output.json"
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-3", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-3.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-4", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-4.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-5", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-5.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-6", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-6.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-7", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-7.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-8", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-8.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-9", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-9.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-10", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-10.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });

  it("automatiqalCLI-example-11", async () => {
    const args = [
      "--file",
      "./runbook-examples/automatiqalCLI-example-11.yaml",
      "--variables",
      "./runbook-examples/automatiqalCLI.variables.yaml",
    ];

    const result = await runProcess(args);

    expect(result.code).to.be.equal(0);
  });
});
