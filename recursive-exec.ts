// recursive-exec ~~ MIT License

// Imports
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

const recursiveExec = {

   find(folder: string, command: string, options?: Partial<Settings>): Result[] {
      const defaults = {
         extensions: null,
         quiet:      false,
         };
      const settings = { ...defaults, ...options };
      const errorMessage =
         !folder ?                            'Must specify the folder path.' :
         !fs.existsSync(folder) ?             'Folder does not exist: ' + folder :
         !fs.statSync(folder).isDirectory() ? 'Folder is not a folder: ' + folder :
         !command ?                           'Command template missing.' :
         null;
      if (errorMessage)
         throw Error('[recursive-exec] ' + errorMessage);
      const startTime =  Date.now();
      const source =     slash(path.normalize(folder)).replace(/\/$/, '');
      const logName =    chalk.gray('recursive-exec');
      const getExts =    () => settings.extensions!.join('|');
      const extensions = !settings.extensions ? '' : `@(${getExts()})`;
      const files =      globSync(source + '/**/*' + extensions, { ignore: '**/node_modules/**/*', nodir: true }).sort();
      const toCamel =    (token: string) => token.replace(/-./g, char => char[1]!.toUpperCase());  //ex: 'fetch-json' --> 'fetchJson'
      if (!settings.quiet)
         log(logName, chalk.magenta(source));
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
      const results = files.map(slash).map(calcResult);
      const previewCommand = (result: Result) => {
         log(logName, chalk.blue.bold('preview:'), chalk.yellow(result.command));
         };
      const execCommand = (result: Result) => {
         if (!settings.quiet)
            log(logName, chalk.blue.bold('command:'), chalk.cyanBright(result.command));
         const task = spawnSync(result.command, { shell: true, stdio: 'inherit' });
         if (task.status !== 0)
            throw Error(`[recursive-exec] Status: ${task.status}\nCommand: ${result.command}`);
         };
      results.forEach(settings.echo ? previewCommand : execCommand);
      const summary = `(files: ${results.length}, ${Date.now() - startTime}ms)`;
      if (!settings.quiet)
         log(logName, chalk.green('done'), chalk.white(summary));
      return results;
      },

   };

export { recursiveExec };
