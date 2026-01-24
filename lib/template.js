import fs from "node:fs";
import path from "node:path";
import { getParentPaths } from "./utils/get-parent-paths.js";
import { camelCase } from "./utils/camel-case.js";
import { kebabCase } from "./utils/kebab-case.js";
import { pascalCase } from "./utils/pascal-case.js";
import { InternalError } from "./internal-error.js";

export class Template {
  #name;
  #templateDirectory;

  get name() {
    return this.#name;
  }

  get #filesDirectory() {
    return path.join(this.#templateDirectory, this.#name, "files");
  }

  get #rootDirectory() {
    return path.resolve(this.#templateDirectory, "..");
  }

  constructor(name, templateDirectory) {
    this.#name = name;
    this.#templateDirectory = templateDirectory;
  }

  async build(name, force = false) {
    console.info(`Building ${this.name} template`);

    const rawFiles = await this.readFiles();

    const tokens = this.#getTokens(name);

    const files = Template.#replaceTokens(rawFiles, tokens);

    this.#validate(files, force);

    await this.#writeFiles(files);
  }

  #getTokens(name) {
    const nameParts = name.replaceAll("\\", "/").split("/");
    return {
      __ROOT__: this.#rootDirectory,
      __NAME__: name,
      __CAMEL_NAME__: camelCase(name),
      __CAMEL_PATH__: nameParts.map(camelCase).join("/"),
      __KEBAB_NAME__: kebabCase(name),
      __KEBAB_PATH__: nameParts.map(kebabCase).join("/"),
      __PASCAL_NAME__: pascalCase(name),
      __PASCAL_PATH__: nameParts.map(pascalCase).join("/"),
    };
  }

  async readFiles() {
    const filesDirectory = this.#filesDirectory;

    const files = fs.existsSync(filesDirectory)
      ? await Template.#scan(filesDirectory)
      : [];

    return files.map(([filename, contents]) => [
      path.relative(filesDirectory, filename),
      contents,
    ]);
  }

  static async findAll(templateName, only = false) {
    const templates = await Template.#getAll();

    return templates.filter(
      (template) =>
        template.name === templateName ||
        (!only && template.name.startsWith(`${templateName}-`))
    );
  }

  #validate(files, force) {
    const existingFiles = files
      .map(([fileName]) => fileName)
      .filter((fileName) => fs.existsSync(fileName));

    for (const file of existingFiles) {
      if (force) {
        console.info(`"${file}" already exists and will be overwritten.`);
      } else {
        throw new InternalError(
          `"${file}" exists. Use the "--force" flag to overwrite.`
        );
      }
    }
  }

  async #writeFiles(files) {
    for (const [fileName, contents] of files) {
      const dirname = path.dirname(fileName);
      if (!fs.existsSync(dirname)) {
        await fs.promises.mkdir(dirname, {
          recursive: true,
        });
      }

      console.info(`Creating "${fileName}"`);
      await fs.promises.writeFile(fileName, contents, "utf8");
    }
  }

  static async #getAll() {
    const templateFolders = Template.#getTemplateFolders();
    const templates = [new InternalTemplate()];
    for (const templateFolder of templateFolders) {
      const entries = await fs.promises.readdir(templateFolder, {
        withFileTypes: true,
      });

      entries
        .filter((entry) => entry.isDirectory())
        .filter((entry) => !entry.name.startsWith("."))
        .map((entry) => new Template(entry.name, templateFolder))
        .forEach((template) => {
          templates.push(template);
        });
    }
    return templates;
  }

  static #replaceTokens(rawFiles, tokens) {
    const replacements = Object.entries(tokens);
    return rawFiles
      .map((data) =>
        data.map((str) =>
          replacements.reduce(
            (str, [key, value]) => str.replaceAll(key, value),
            str
          )
        )
      )
      .map(([fileName, contents]) => [path.resolve(fileName), contents]);
  }

  static async #scan(dir) {
    const entries = await fs.promises.readdir(dir, {
      withFileTypes: true,
    });

    const output = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        output.push(...(await Template.#scan(fullPath)));
      } else if (entry.isFile()) {
        output.push([fullPath, await fs.promises.readFile(fullPath, "utf8")]);
      }
    }

    return output;
  }

  static #getTemplateFolders() {
    return getParentPaths(process.cwd())
      .map((p) => path.join(p, "templates"))
      .filter((p) => fs.existsSync(p));
  }
}

class InternalTemplate extends Template {
  constructor() {
    super("template", path.join(process.cwd(), "templates"));
  }

  async readFiles() {
    return [
      ["__ROOT__/templates/__KEBAB_NAME__/README.md", "# __NAME__\n"],
      ["__ROOT__/templates/__KEBAB_NAME__/files/.gitkeep", ""],
    ];
  }
}
