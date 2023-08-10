# recursive-exec
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_Run a command on each file in a folder and its subfolders (CLI tool designed for use in npm scripts)_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/recursive-exec/blob/main/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/recursive-exec.svg)](https://www.npmjs.com/package/recursive-exec)
[![Build](https://github.com/center-key/recursive-exec/workflows/build/badge.svg)](https://github.com/center-key/recursive-exec/actions/workflows/run-spec-on-push.yaml)

**recursive-exec** is `find -type f -exec` for use in your project's **package.json** file.

<img src=https://raw.githubusercontent.com/center-key/recursive-exec/main/screenshot.png
width=800 alt=screenshot>

## A) Setup
Install package for node:
```shell
$ npm install --save-dev recursive-exec
```

## B) Usage
### 1. npm scripts
Run `recursive-exec` from the `"scripts"` section of your **package.json** file.

Parameters:
* The **first** parameter is the *source* folder.
* The **second** parameter is the *command template* string.

Example **package.json** scripts:
```json
   "scripts": {
      "minimize-js": "recursive-exec build/web --ext=.js 'uglifyjs build/web/{{filename}} --output dist/web/{{basename}}.min.js'"
   },
```

The command template supports 4 variables:
| Variable       | Description                                                  | Example                       |
| -------------- | ------------------------------------------------------------ | ----------------------------- |
| `{{filename}}` | Relative path including filename.                            | `'libraries/d3.js'`           |
| `{{basename}}` | Relative path including filename without the file extension. | `'libraries/d3'`              |
| `{{path}}`     | Relative path without filename.                              | `'libraries'`                 |
| `{{file}}`     | Full path including filename.                                | `'build/web/libraries/d3.js'` |

### 2. Global
You can install **recursive-exec** globally and then run it anywhere directly from the terminal.

Example terminal command to minimize JavaScript files:
```shell
$ npm install --global recursive-exec
$ recursive-exec build/web --ext=.js "uglifyjs build/web/{{filename}} --output dist/web/{{basename}}.min.js"
```

### 3. CLI flags
Command-line flags:
| Flag         | Description                                           | Value      |
| ------------ | ----------------------------------------------------- | ---------- |
| `--ext`      | Filter files by file extension, such as `.js`.<br>Use a comma to specify multiple extensions. | **string** |
| `--note`     | Place to add a comment only for humans.               | **string** |
| `--quiet`    | Suppress informational messages.                      | N/A        |

Examples:
   - `recursive-exec src/web --ext=.less 'lessc src/web/{{filename}} build/web/{{basename}}.css'"`<br>
   Compile all LESS files in the **src/web** folder into CSS files in the **build/web** folder.

   - `recursive-exec build/web --ext=.css 'csso build/web/{{filename}} --output dist/web/{{filename}}'"`<br>
   Optimize the CSS files in **build/web** and save the new files to the **dist/web** folder.

   - `recursive-exec build/web --ext=.js 'uglifyjs build/web/{{filename}} --output dist/web/{{basename}}.min.js'"`<br>
   Minimize the JavaScript files in **build/web** and save the new files to the **dist/web** folder with the **.min.js** file extension.

## C) Application Code
Even though **recursive-exec** is primarily intended for build scripts, the package can easily be used programmatically in ESM and TypeScript projects.

Example:
``` typescript
import { recursiveExec } from 'recursive-exec';

const results = recursiveExec.find('src/web', 'ls -o {{file}}', { quite: true });
console.log('Number of files:', results.length);
```

See the **TypeScript Declarations** at the top of [recursive-exec.ts](recursive-exec.ts) for documentation.

<br>

---
**CLI Build Tools**
   - 🎋 [add-dist-header](https://github.com/center-key/add-dist-header):&nbsp; _Prepend a one-line banner comment (with license notice) to distribution files_
   - 📄 [copy-file-util](https://github.com/center-key/copy-file-util):&nbsp; _Copy or rename a file with optional package version number_
   - 📂 [copy-folder-util](https://github.com/center-key/copy-folder-util):&nbsp; _Recursively copy files from one folder to another folder_
   - 🪺 [recursive-exec](https://github.com/center-key/recursive-exec):&nbsp; _Run a command on each file in a folder and its subfolders_
   - 🔍 [replacer-util](https://github.com/center-key/replacer-util):&nbsp; _Find and replace strings or template outputs in text files_
   - 🔢 [rev-web-assets](https://github.com/center-key/rev-web-assets):&nbsp; _Revision web asset filenames with cache busting content hash fingerprints_
   - 🚆 [run-scripts-util](https://github.com/center-key/run-scripts-util):&nbsp; _Organize npm scripts into named groups of easy to manage commands_
   - 🚦 [w3c-html-validator](https://github.com/center-key/w3c-html-validator):&nbsp; _Check the markup validity of HTML files using the W3C validator_

Feel free to submit questions at:<br>
[github.com/center-key/recursive-exec/issues](https://github.com/center-key/recursive-exec/issues)

[MIT License](LICENSE.txt)
