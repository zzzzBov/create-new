# @zzzzbov/create-new

`create-new` is a file generation utility for quickly creating files from templates.

The `new` script searches for templates from ancestor directories and generates files for all matched templates.

<details>
<summary>Table of Contents</summary>

- [@zzzzbov/create-new](#zzzzbovcreate-new)
  - [Usage](#usage)
    - [Options](#options)
  - [How Templates Work](#how-templates-work)
    - [Template Name Matching](#template-name-matching)
    - [Creating Templates](#creating-templates)
      - [Token Replacement](#token-replacement)
      - [Built-in Template](#built-in-template)

</details>

## Usage

With `npm create`

```bash
npm create @zzzzbov/new <template> <name> [-- [...options]]
```

With `npx`

```bash
npx new <template> <name> [...options] --package=@zzzzbov/create-new
```

Global installation

```bash
npm install @zzzzbov/create-new -g

new <template> <name> [...options]
```

### Options

<dl>
<dt>

`--force`

</dt>
<dd>

When present, `new` will generate files from the matched template and overwrite any existing files.

</dd>
<dt>

`--only`

</dt>
<dd>

When present, `new` will only generate files from templates that exactly match the specified `<template>` name.

</dd>
</dl>

## How Templates Work

The `new` script finds templates by checking for directories named `templates` in every directory from the current directory all the way to the root.

This means that if you're running `new` from `/lorem/ipsum/dolor/sit/amet/`, it will look for all of the following directories:

- `/lorem/ipsum/dolor/sit/amet/templates`
- `/lorem/ipsum/dolor/sit/templates`
- `/lorem/ipsum/dolor/templates`
- `/lorem/ipsum/templates`
- `/lorem/templates`
- `/templates`

If any of those directories exist, it will treat all sub-directories as templates.

For example, if your filesystem contained the following directories:

```txt
root
├───lorem
│   ├───ipsum
│   │   ├───dolor
│   │   └───templates
│   │       ├───hello
│   │       └───world
│   └───templates
│       ├───buzz
│       └───fizz
└───templates
    ├───bar
    └───foo
```

Calling `new` from `/lorem/ipsum/dolor/` or `/lorem/ipsum/` could use any of:

- `bar`
- `buzz`
- `fizz`
- `foo`
- `hello`
- `world`

Calling `new` from `/lorem/` could use any of:

- `bar`
- `buzz`
- `fizz`
- `foo`

And calling `new` from `/` could use:

- `bar`
- `foo`

### Template Name Matching

When generating templates, all templates are used that either:

1. match the template name exactly
2. start with the template name followed by `-`

If the `--only` option is specified, only templates whose names are an exact match (1) will be used.

As an example, a component template might be separated into separate parts as:

```txt
templates
├───component
├───component-docs
└───component-tests
```

And calling `new component <name>` will generate the files from:

- `component`
- `component-docs`
- `component-tests`

This can be useful when new files are added to an older template.

Continuing this example, a `component-styles` template could be added so that all new components include the new files, and existing components could be updated by calling `new component-styles <name>`.

### Creating Templates

Template directories contain a `files` directory which then contains all of the files to generate from the template.

This allows the parent directory to contain metadata such as a `README`, `LICENSE`, or `.git` repo.

> In the future the parent directory may have an optional manifest or configuration script, so it's recommended that authors avoid adding unnecessary `js` or `json` files in order to ensure forward-compatibility.

Files and folders are generated using their relative paths from their `files` directory applied to the current working directory.

As an example, calling `new example data` using:

```txt
templates
└───example
    │   README.md
    │
    └───files
            bar.js
            foo.md
```

will create `bar.js` and `foo.md` files in the current working directory.

#### Token Replacement

Beyond simply copying and pasting files from one directory to another, the `new` script includes token replacement features which enable the creation of much more useful templates.

The following tokens are replaced in both file paths and their contents:

<dl>
<dt>

`__ROOT__`

</dt>
<dd>

The path from the filesystem root to the parent folder of the `template` directory where the current template resides.

As an example consider the following template:

```txt
root
└───lorem
    ├───ipsum
    │   └───dolor
    │
    └───templates
        └───example
            └───files
                ├───__ROOT__/foo.md
                └───bar.md
```

Calling `new example data` from `/lorem/ipsum/dolor` would result in the creation of:

- `/lorem/foo.md`
- `/lorem/ipsum/dolor/bar.md`

Whereas calling `new example data` from `/lorem/ipsum` would result in the creation of:

- `/lorem/foo.md`
- `/lorem/ipsum/bar.md`

</dd>
<dt>

`__NAME__`

</dt>
<dd>

The value of the `<name>` parameter when calling `new <template> <name>`.

The value is not escaped, making it generally unsuitable for use within paths.

</dd>
<dt>

`__CAMEL_NAME__`

</dt>
<dd>

The camelCased version of the name.

"Example Component" becomes "exampleComponent"

</dd>
<dt>

`__CAMEL_PATH__`

</dt>
<dd>

The camelCased version of the name with path characters (`/` and `\`) preserved.

"Example Component/Sub Component" becomes "exampleComponent/subComponent"

</dd>
<dt>

`__KEBAB_NAME__`

</dt>
<dd>

The kebab-cased version of the name.

"Example Component" becomes "example-component"

</dd>
<dt>

`__KEBAB_PATH__`

</dt>
<dd>

The kebab-cased version of the name with path characters (`/` and `\`) preserved.

"Example Component/Sub Component" becomes "example-component/sub-component"

</dd>
<dt>

`__PASCAL_NAME__`

</dt>
<dd>

The PascalCased version of the name.

"Example Component" becomes "ExampleComponent"

</dd>
<dt>

`__PASCAL_PATH__`

</dt>
<dd>

The PascalCased version of the name with path characters (`/` and `\`) preserved.

"Example Component/Sub Component" becomes "ExampleComponent/SubComponent"

</dd>
<dt>

`__NOW__`

</dt>
<dd>

The current date & time in ISO-8601 format.

</dd>
</dl>

#### Built-in Template

In order to assist in template creation, `new` includes a `template` template, which generates the following structure in the current directory:

```txt
templates
└───__KEBAB_NAME__
    │   README.md
    │
    └───files
            .gitkeep
```
