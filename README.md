# recursive-exec
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_Run a command on each file in a folder and its subfolders (CLI tool designed for use in npm package.json scripts)_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/recursive-exec/blob/main/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/recursive-exec.svg)](https://www.npmjs.com/package/recursive-exec)
[![Build](https://github.com/center-key/recursive-exec/workflows/build/badge.svg)](https://github.com/center-key/recursive-exec/actions/workflows/run-spec-on-push.yaml)

**recursive-exec** is the Unix `find -type f -exec` command for use in your project's **package.json** file.

<img src=https://raw.githubusercontent.com/center-key/recursive-exec/main/screenshot.png
width=800 alt=screenshot>

## A) Setup
Install package for node:
```shell
$ npm install --save-dev recursive-exec
```

## B) Usage
### 1. npm package.json scripts
Run `recursive-exec` from the `"scripts"` section of your **package.json** file.

Parameters:
* The **first** parameter is the *source* folder.
* The **second** parameter is the *command template* string.

Example **package.json** scripts:
```json
   "scripts": {
      "minimize-js": "recursive-exec build/web --ext=.js 'uglifyjs {{file}} --output dist/web/{{basename}}.min.js'"
   },
```

The command template supports 6 variables:
| Template Variable   | Description                                   | Example (source: `'build/web'`)  |
| ------------------- | --------------------------------------------- | -------------------------------- |
| `{{file}}`          | Full path including filename.                 | `'build/web/lib/fetch-json.js'`  |
| `{{filename}}`      | Relative path including filename.             | `'lib/fetch-json.js'`            |
| `{{basename}}`      | Relative path including filename<br>without file extension. | `'lib/fetch-json'` |
| `{{path}}`          | Relative path without filename.               | `'lib'`                          |
| `{{name}}`          | Basename of file.                             | `'fetch-json'`                   |
| `{{nameCamelCase}}` | Basename of file converted to camel case.     | `'fetchJson'`                    |

### 2. Command-line npx
Example terminal command to minimize JavaScript files:
```shell
$ npm install --save-dev recursive-exec
$ npx recursive-exec build/web --ext=.js "uglifyjs {{file}} --output dist/web/{{basename}}.min.js"
```
You can also install **recursive-exec** globally (`--global`) and then run it anywhere directly from the terminal.

### 3. CLI flags
Command-line flags:
| Flag         | Description                                                | Value      |
| ------------ | ---------------------------------------------------------- | ---------- |
| `--echo`     | Show dry run preview of each command without executig it.  | N/A        |
| `--exclude`  | Comma separated list of strings to match in paths to skip. | **string** |
| `--ext`      | Filter files by file extension, such as `.js`.<br>Use a comma to specify multiple extensions. | **string** |
| `--note`     | Place to add a comment only for humans.                    | **string** |
| `--quiet`    | Suppress informational messages.                           | N/A        |

Examples:
   - `recursive-exec src/web --ext=.less 'lessc src/web/{{filename}} build/web/{{basename}}.css'`<br>
   Compiles all LESS files in the **src/web** folder into CSS files in the **build/web** folder.

   - `recursive-exec src/web --ext=.less 'lessc {{file}} build/web/{{basename}}.css'`<br>
   Identical to the previous example since `{{file}}` includes the **source** folder (`src/web`) in the path.

   - `recursive-exec build/web --ext=.css 'csso {{file}} --output dist/web/{{filename}}'`<br>
   Optimizes the CSS files in the **build/web** folder and save the new files to the **dist/web** folder.

   - `recursive-exec build/web --ext=.js --quiet 'make-dir dist/web/{{path}}'`<br>
   Duplicates the folder structure from **build/web** over to **dist/web** (first run `npm install --save-dev make-dir-cli`).

   - `recursive-exec build/web --ext=.js 'uglifyjs {{file}} --output dist/web/{{basename}}.min.js'`<br>
   Minimizes the JavaScript files in the **build/web** folder and saves the new files to the **dist/web** folder with the **.min.js** file extension.

   - `recursive-exec src 'glob {{file}}'`<br>
   Lists out all source files.

   - `recursive-exec build/web-app --ext=.js --exclude=modules 'rollup {{file}} --file dist/web-app/{{filename}} --name {{nameCamelCase}}'`<br>
   Uses **rollup** to bundle the JavaScript for each web page but skip over the **modules** folders.

_**Note:** Single quotes in commands are normalized so they work cross-platform and avoid the errors often encountered on Microsoft Windows._

## C) Application Code
Even though **recursive-exec** is primarily intended for build scripts, the package can be used programmatically in ESM and TypeScript projects.

Example:
``` typescript
import { recursiveExec } from 'recursive-exec';

const results = recursiveExec.find('src/web', 'ls -o {{file}}', { quite: true });
console.log('Number of files:', results.length);
```

See the **TypeScript Declarations** at the top of [recursive-exec.ts](recursive-exec.ts) for documentation.

<br>

---
**CLI Build Tools for package.json**
   - 🎋 [add-dist-header](https://github.com/center-key/add-dist-header):&nbsp; _Prepend a one-line banner comment (with license notice) to distribution files_
   - 📄 [copy-file-util](https://github.com/center-key/copy-file-util):&nbsp; _Copy or rename a file with optional package version number_
   - 📂 [copy-folder-util](https://github.com/center-key/copy-folder-util):&nbsp; _Recursively copy files from one folder to another folder_
   - 🪺 [recursive-exec](https://github.com/center-key/recursive-exec):&nbsp; _Run a command on each file in a folder and its subfolders_
   - 🔍 [replacer-util](https://github.com/center-key/replacer-util):&nbsp; _Find and replace strings or template outputs in text files_
   - 🔢 [rev-web-assets](https://github.com/center-key/rev-web-assets):&nbsp; _Revision web asset filenames with cache busting content hash fingerprints_
   - 🚆 [run-scripts-util](https://github.com/center-key/run-scripts-util):&nbsp; _Organize npm package.json scripts into named groups of easy to manage commands_
   - 🚦 [w3c-html-validator](https://github.com/center-key/w3c-html-validator):&nbsp; _Check the markup validity of HTML files using the W3C validator_

Feel free to submit questions at:<br>
[github.com/center-key/recursive-exec/issues](https://github.com/center-key/recursive-exec/issues)

[MIT License](LICENSE.txt)
