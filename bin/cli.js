#!/usr/bin/env node
////////////////////
// recursive-exec //
// MIT License    //
////////////////////

// Usage in package.json:
//    "recursiveExecConfig": {
//       "commands": {
//          "make-min-file": "uglifyjs {{file}} --output dist/{{basename}}.min.js"
//       }
//    },
//    "scripts": {
//       "make-css": "recursive-exec src/web --ext=.less 'lessc {{file}} build/web/{{basename}}.css'",
//       "minimize-css": "recursive-exec build/web --ext=.css 'csso {{file}} --output dist/{{filename}}'",
//       "minimize-js": "recursive-exec build --ext=.js {{command:make-min-file}}"
//    },
//
// Contributors to this project:
//    $ cd recursive-exec
//    $ npm install
//    $ npm test
//    $ node bin/cli.js spec/fixtures --ext=.js,.css 'npx glob {{file}}'

// Imports
import { cliArgvUtil } from 'cli-argv-util';
import fs from 'fs';

// Modules
import { recursiveExec } from '../dist/recursive-exec.js';

// Parameters and Flags
const validFlags = ['echo', 'exclude', 'ext', 'note', 'quiet'];
const cli =        cliArgvUtil.parse(validFlags);
const folder =     cli.params[0];
const command =    cli.params[1];

// Command Macro
const macroName =  command.match(/^{{command:(.*)}}$/)?.[1];
const readPkg =    () => JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const macroValue = macroName && readPkg()?.recursiveExecConfig?.commands?.[macroName];

// Recursive Exec
const error =
   cli.invalidFlag ?          cli.invalidFlagMsg :
   !folder ?                  'Missing source folder.' :
   !command ?                 'Missing command to execute.' :
   cli.paramCount > 2 ?       'Extraneous parameter: ' + cli.params[2] :
   macroName && !macroValue ? 'Command macro not defined: ' + macroName :
   null;
if (error)
   throw new Error('[recursive-exec] ' + error);
const options = {
   echo:       cli.flagOn.echo,
   excludes:   cli.flagMap.exclude?.split(',') ?? null,
   quiet:      cli.flagOn.quiet,
   extensions: cli.flagMap.ext?.split(',') ?? null,
   };
recursiveExec.find(folder, macroValue ?? command, options);
