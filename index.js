#! /usr/bin/env node

/**
 * See template.md for details
 */
import { error } from "./lib/utils/error.js";
import { parseArgv } from "./lib/utils/parse-argv.js";
import { Template } from "./lib/template.js";
import { InternalError } from "./lib/internal-error.js";

const showHelp = () => {
  console.log(
    `
npm create @zzzzbov/new <template> <name> [-- [...options]]

Create new files from a template.

Options:
--force   Overwrite existing files
--only    Create only the named template
`.trim()
  );
};

const run = async ({
  _: [templateName, name],
  _: args,
  force = false,
  only = false,
  "?": help = false,
}) => {
  if (help || !args.length) {
    showHelp();
    return;
  }

  if (args.length === 1) {
    throw new InternalError(
      "Both <template> and <name> are required. Only <template> was provided."
    );
  }

  const templates = await Template.findAll(templateName, only ?? false);

  if (!templates.length) {
    throw new InternalError(
      `The "${templateName}" template could not be found. Please check your spelling and try again.`
    );
  } else {
    for (const template of templates) {
      await template.build(name, force);
    }
  }
};

run(parseArgv(process.argv.slice(2))).catch((e) => {
  const message = e instanceof Error ? e.message : "An unknown error occurred.";
  error(message);
  if (e instanceof Error && !(e instanceof InternalError)) {
    console.log(e.stack);
  }
  console.log();
  showHelp();
});
