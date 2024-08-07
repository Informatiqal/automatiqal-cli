import { writeFileSync } from "fs";
import { dump } from "js-yaml";

export const schemaURL = `# yaml-language-server: $schema=https://github.com/Informatiqal/automatiqal-cli-schema/blob/main/schemas/runbook.json?raw=true`;

export function generateSampleWindows(format: string) {
  if (!format) format = "yaml";

  const qseowSample = {
    name: "Sample run book",
    edition: "windows",
    environment: {
      host: "${host}",
      port: 4242,
      authentication: {
        cert: "${certificate}",
        key: "${certificate_key}",
        user_dir: "${user_dir}",
        user_name: "${user_name}",
      },
    },
    tasks: [
      {
        name: "Import application",
        description: "Import brand new qvf",
        operation: "app.upload",
        details: {
          file: "path/to/the/app/qvf",
          name: "Import Name",
        },
      },
      {
        name: "Create new stream",
        description: "create brand new stream for our app",
        operation: "stream.create",
        details: {
          name: "My new stream",
        },
      },
      {
        name: "Publish imported app",
        description: "Publish the imported app into the new stream",
        operation: "app.publish",
        filter: "name eq 'Import Name'",
        details: {
          stream: "My new stream",
        },
        options: {
          multiple: false,
        },
      },
      {
        name: "Update app",
        description:
          "add some custom properties and tags to the imported and published app",
        filter: "name eq 'Import Name'",
        operation: "app.update",
        options: {
          multiple: true,
        },
        details: {
          customProperties: [
            "customProperty1=value1",
            "customProperty1=value2",
            "customPropertyOther=otherValue",
          ],
          tags: ["tag 1", "tag 2", "tag 3"],
        },
      },
    ],
  };

  const variables = `host=my-qlik-host.com
certificate=path/to/client.pem
certificate_key=path/to/client_key.pem
user_dir=SOME-USER-DIR
user_name=SOME-USER`;

  try {
    writeFileSync(
      ".\\automatiqal-sample.yaml",
      `${schemaURL}

${dump(qseowSample, {
  // indent: 4,
  lineWidth: 300,
})}`
    );
  } catch (e) {
    console.log(`\u274C ERROR: Unable to create sample file"`);
    console.log(e.message);
  }

  try {
    writeFileSync(".\\automatiqal-sample.variables.yaml", variables);
  } catch (e) {
    console.log(`\u274C ERROR: Unable to create sample variables file"`);
    console.log(e.message);
  }

  console.log(`\u2705 "automatiqal-sample.yaml" generated!`);
  console.log(`\u2705 "automatiqal-sample.variables.yaml" generated!`);
  console.log("");
  console.log(`\u2705 \x1b[33mMore examples can be found at:\x1b[0m`);
  console.log(
    "    - https://github.com/Informatiqal/automatiqal-cli/tree/main/runbook-examples"
  );
  console.log("    - https://github.com/Informatiqal/automatiqal-recipes");
  process.exit(0);
}

export function generateSampleSaaS(format: string) {
  if (!format) format = "yaml";

  const saasSample = {
    name: "Sample run book",
    edition: "saas",
    environment: {
      host: "${host}",
      port: 443,
      authentication: {
        token: "${api_key}",
      },
    },
    tasks: [
      {
        name: "Create new space",
        operation: "space.create",
        details: {
          name: "My new space",
          type: "shared",
        },
      },
      {
        name: "Import brand new app",
        operation: "app.import",
        details: {
          file: "path/to/the/qvf",
        },
      },
      {
        name: "Add app to space",
        operation: "app.addToSpace",
        source: "Import brand new app",
        details: {
          spaceId: "$${Create new space}",
        },
      },
    ],
  };

  const variables = `host=tenant.eu.qlikcloud.com
api_key=generated-api-key`;

  try {
    writeFileSync(
      ".\\automatiqal-sample-saas.yaml",
      `${schemaURL}

${dump(saasSample, {
  // indent: 4,
  lineWidth: 300,
})}`
    );
  } catch (e) {
    console.log(`\u274C ERROR: Unable to create sample file"`);
    console.log(e.message);
  }

  try {
    writeFileSync(".\\automatiqal-sample-saas.variables.yaml", variables);
  } catch (e) {
    console.log(`\u274C ERROR: Unable to create sample variables file"`);
    console.log(e.message);
  }

  console.log(`\u2705 "automatiqal-sample-saas.yaml" generated!`);
  console.log(`\u2705 "automatiqal-sample-saas.variables.yaml" generated!`);
  console.log("");
  console.log(`\u2705 \x1b[33mMore examples can be found at:\x1b[0m`);
  console.log(
    "    - https://github.com/Informatiqal/automatiqal-cli/tree/main/runbook-examples"
  );
  console.log("    - https://github.com/Informatiqal/automatiqal-recipes");
  process.exit(0);
}
