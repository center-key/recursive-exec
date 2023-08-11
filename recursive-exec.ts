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
   extensions: string[] | null,  //filter files by file extensions, example: ['.js', '.css']
   quiet:      boolean,          //suppress informational messages
   };
export type Result = {
   folder:   string,
   file:     string,
   path:     string,
   filename: string,
   basename: string,
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
      if (!settings.quiet)
         log(logName, chalk.magenta(source));
      const calcResult = (file: string) => {
         const filename = file.substring(source.length + 1);
         const relPath =  file.substring(source.length + 1, file.length - path.basename(file).length - 1);
         const basename = filename.substring(0, filename.length - path.extname(filename).length);
         const interpolate = (template: string) => template
            .replaceAll('{{basename}}', basename)
            .replaceAll('{{file}}',     file)
            .replaceAll('{{filename}}', filename)
            .replaceAll('{{path}}',     relPath);
         return {
            folder:   source,
            file:     file,
            path:     relPath,
            filename: filename,
            basename: basename,
            command:  interpolate(command),
            };
         };
      const results = files.map(calcResult);
      const execCommand = (result: Result) => {
         if (!settings.quiet)
            log(logName, chalk.blue.bold('command:'), chalk.cyanBright(result.command));
         const task = spawnSync(result.command, { shell: true, stdio: 'inherit' });
         if (task.status !== 0)
            throw Error(`[recursive-exec] Status: ${task.status}\nCommand: ${result.command}`);
         };
      results.forEach(execCommand);
      const summary = `(files: ${results.length}, ${Date.now() - startTime}ms)`;
      if (!settings.quiet)
         log(logName, chalk.green('done'), chalk.white(summary));
      return results;
      },

   };

export { recursiveExec };
