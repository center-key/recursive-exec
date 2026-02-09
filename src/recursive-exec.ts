// recursive-exec ~~ MIT License
//
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
import { globSync } from 'glob';
import { spawnSync } from 'node:child_process';
import chalk from 'chalk';
import fs    from 'fs';
import log   from 'fancy-log';
import path  from 'path';
import slash from 'slash';

// Types
export type Settings = {
   echo:       boolean,          //show dry run preview of each command without executig it
   excludes:   string[] | null,  //list of strings to match in paths to skip
   extensions: string[] | null,  //filter files by file extensions, example: ['.js', '.css']
   quiet:      boolean,          //suppress informational messages
   };
export type Result = {
   folder:   string,
   file:     string,
   path:     string,
   filename: string,
   basename: string,
   name:     string,
   command:  string,
   };
type Pkg = { recursiveExecConfig?: { commands?: { [command: string]: string} } };  //package.json

const recursiveExec = {

   assert(ok: unknown, message: string | null) {
      if (!ok)
         throw new Error(`[recursive-exec] ${message}`);
      },

   cli() {
      const validFlags = ['echo', 'exclude', 'ext', 'note', 'quiet'];
      const cli =        cliArgvUtil.parse(validFlags);
      const folder =     cli.params[0];
      const command =    cli.params[1];
      const macroName =  command?.match(/^{{command:(.*)}}$/)?.[1];
      const readPkg =    () => <Pkg>JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const macroValue = macroName && readPkg().recursiveExecConfig?.commands?.[macroName];
      const error =
         cli.invalidFlag ?          cli.invalidFlagMsg :
         !folder ?                  'Missing source folder.' :
         !command ?                 'Missing command to execute.' :
         cli.paramCount > 2 ?       'Extraneous parameter: ' + cli.params[2]! :
         macroName && !macroValue ? 'Command macro not defined: ' + macroName :
         null;
      recursiveExec.assert(!error, error);
      const options: Settings = {
         echo:       cli.flagOn.echo!,
         excludes:   cli.flagMap.exclude?.split(',') ?? null,
         quiet:      cli.flagOn.quiet!,
         extensions: cli.flagMap.ext?.split(',') ?? null,
         };
      recursiveExec.find(folder!, macroValue ?? command!, options);
      },

   find(folder: string, command: string, options?: Partial<Settings>): Result[] {
      const defaults: Settings = {
         echo:       false,
         excludes:   null,
         extensions: null,
         quiet:      false,
         };
      const settings = { ...defaults, ...options };
      const error =
         !folder ?                            'Must specify the folder path.' :
         !fs.existsSync(folder) ?             'Folder does not exist: ' + folder :
         !fs.statSync(folder).isDirectory() ? 'Folder is not a folder: ' + folder :
         !command ?                           'Command template missing.' :
         null;
      recursiveExec.assert(!error, error);
      const startTime =   Date.now();
      const source =      slash(path.normalize(folder)).replace(/\/$/, '');
      const name =        chalk.gray('recursive-exec');
      const dryRunNote =  settings.echo ? chalk.yellow('[dry run]') : '';
      const getExts =     () => settings.extensions!.join('|');
      const extensions =  !settings.extensions ? '' : `@(${getExts()})`;
      const globOptions = { ignore: '**/node_modules/**/*', nodir: true };
      const files =       globSync(source + '/**/*' + extensions, globOptions).map(slash);
      const excludes =    settings.excludes || [];
      const keep =        (file: string) => !excludes.find(exclude => file.includes(exclude));
      const toCamel =     (token: string) => token.replace(/-./g, char => char[1]!.toUpperCase());  //ex: 'fetch-json' --> 'fetchJson'
      if (!settings.quiet)
         log(name, chalk.blue(source), dryRunNote);
      const calcResult = (file: string) => {
         const parts =    path.parse(file);
         const filename = file.substring(source.length + 1);       //ex: 'build/lib/fetch-json.js' --> 'lib/fetch-json.js'
         const relative = parts.dir.substring(source.length + 1);  //ex: 'build/lib/fetch-json.js' --> 'lib'
         const basename = filename.substring(0, filename.length - path.extname(filename).length);
         const interpolate = (template: string) => template
            .replaceAll('{{file}}',          file)                  //ex: 'build/lib/fetch-json.js'
            .replaceAll('{{filename}}',      filename)              //ex: 'lib/fetch-json.js'
            .replaceAll('{{basename}}',      basename)              //ex: 'lib/fetch-json'
            .replaceAll('{{path}}',          relative)              //ex: 'lib'
            .replaceAll('{{name}}',          parts.name)            //ex: 'fetch-json'
            .replaceAll('{{nameCamelCase}}', toCamel(parts.name));  //ex: 'fetchJson'
         return {
            folder:   source,
            file:     file,
            path:     relative,
            filename: filename,
            basename: basename,
            name:     parts.name,
            command:  interpolate(command),
            };
         };
      const results = files.filter(keep).sort().map(calcResult);
      const execCommand = (result: Result, i: number) => {
         if (!settings.quiet || settings.echo)
            log(name, chalk.magenta(i + 1), chalk.cyanBright(result.command), dryRunNote);
         const exec = () => {
            const task =     spawnSync(result.command, { shell: true, stdio: 'inherit' });
            const errorMsg = () => `Status: ${task.status}, Command: ${result.command}`;
            recursiveExec.assert(task.status === 0, errorMsg());
            };
         if (!settings.echo)
            exec();
         };
      results.forEach(execCommand);
      const summary = `(files: ${results.length}, ${Date.now() - startTime}ms)`;
      if (!settings.quiet)
         log(name, chalk.green('done'), chalk.white(summary));
      return results;
      },

   };

export { recursiveExec };
