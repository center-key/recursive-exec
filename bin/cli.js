#!/usr/bin/env node
////////////////////
// recursive-exec //
// MIT License    //
////////////////////

// Usage in package.json:
//    "scripts": {
//       "make-css": "recursive-exec src/web --ext=.less 'lessc {{file}} build/web/{{basename}}.css'",
//       "minimize-css": "recursive-exec build/web --ext=.css 'csso {{file}} --output dist/{{filename}}'",
//       "minimize-js": "recursive-exec build --ext=.js 'uglifyjs {{file}} --output dist/{{basename}}.min.js'"
//    },
//
// Contributors to this project:
//    $ cd recursive-exec
//    $ npm install
//    $ npm test
//    $ node bin/cli.js spec/fixtures/source --ext=.js,.css 'npx glob {{file}}'

// Imports
import { cliArgvUtil } from 'cli-argv-util';

// Modules
import { recursiveExec } from '../dist/recursive-exec.js';

// Parameters and flags
const validFlags = ['ext', 'note', 'quiet'];
const cli =        cliArgvUtil.parse(validFlags);
const folder =     cli.params[0];
const command =    cli.params[1];

// Recursive Exec
const error =
   cli.invalidFlag ?     cli.invalidFlagMsg :
   !folder ?             'Missing source folder.' :
   !command ?            'Missing command to execute.' :
   cli.paramsCount > 2 ? 'Extraneous parameter: ' + cli.params[2] :
   null;
if (error)
   throw Error('[recursive-exec] ' + error);
const options = {
   quiet:      cli.flagOn.quiet,
   extensions: cli.flagMap.ext?.split(',') ?? null,
   };
recursiveExec.find(folder, command, options);
