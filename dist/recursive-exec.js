//! recursive-exec v1.1.1 ~~ https://github.com/center-key/recursive-exec ~~ MIT License

import { cliArgvUtil } from 'cli-argv-util';
import { globSync } from 'glob';
import { spawnSync } from 'node:child_process';
import chalk from 'chalk';
import fs from 'fs';
import log from 'fancy-log';
import path from 'path';
import slash from 'slash';
const recursiveExec = {
    assert(ok, message) {
        if (!ok)
            throw new Error(`[recursive-exec] ${message}`);
    },
    cli() {
        const validFlags = ['echo', 'exclude', 'ext', 'note', 'quiet'];
        const cli = cliArgvUtil.parse(validFlags);
        const folder = cli.params[0];
        const command = cli.params[1];
        const macroName = command?.match(/^{{command:(.*)}}$/)?.[1];
        const readPkg = () => JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        const macroValue = macroName && readPkg().recursiveExecConfig?.commands?.[macroName];
        const error = cli.invalidFlag ? cli.invalidFlagMsg :
            !folder ? 'Missing source folder.' :
                !command ? 'Missing command to execute.' :
                    cli.paramCount > 2 ? 'Extraneous parameter: ' + cli.params[2] :
                        macroName && !macroValue ? 'Command macro not defined: ' + macroName :
                            null;
        recursiveExec.assert(!error, error);
        const options = {
            echo: cli.flagOn.echo,
            excludes: cli.flagMap.exclude?.split(',') ?? null,
            quiet: cli.flagOn.quiet,
            extensions: cli.flagMap.ext?.split(',') ?? null,
        };
        recursiveExec.find(folder, macroValue ?? command, options);
    },
    find(folder, command, options) {
        const defaults = {
            echo: false,
            excludes: null,
            extensions: null,
            quiet: false,
        };
        const settings = { ...defaults, ...options };
        const error = !folder ? 'Must specify the folder path.' :
            !fs.existsSync(folder) ? 'Folder does not exist: ' + folder :
                !fs.statSync(folder).isDirectory() ? 'Folder is not a folder: ' + folder :
                    !command ? 'Command template missing.' :
                        null;
        recursiveExec.assert(!error, error);
        const startTime = Date.now();
        const source = slash(path.normalize(folder)).replace(/\/$/, '');
        const logName = chalk.gray('recursive-exec');
        const getExts = () => settings.extensions.join('|');
        const extensions = !settings.extensions ? '' : `@(${getExts()})`;
        const globOptions = { ignore: '**/node_modules/**/*', nodir: true };
        const files = globSync(source + '/**/*' + extensions, globOptions).map(slash);
        const excludes = settings.excludes || [];
        const keep = (file) => !excludes.find(exclude => file.includes(exclude));
        const toCamel = (token) => token.replace(/-./g, char => char[1].toUpperCase());
        if (!settings.quiet)
            log(logName, chalk.magenta(source), settings.echo ? chalk.yellow('(dry run)') : '');
        const calcResult = (file) => {
            const parts = path.parse(file);
            const filename = file.substring(source.length + 1);
            const relative = parts.dir.substring(source.length + 1);
            const basename = filename.substring(0, filename.length - path.extname(filename).length);
            const interpolate = (template) => template
                .replaceAll('{{file}}', file)
                .replaceAll('{{filename}}', filename)
                .replaceAll('{{basename}}', basename)
                .replaceAll('{{path}}', relative)
                .replaceAll('{{name}}', parts.name)
                .replaceAll('{{nameCamelCase}}', toCamel(parts.name));
            return {
                folder: source,
                file: file,
                path: relative,
                filename: filename,
                basename: basename,
                name: parts.name,
                command: interpolate(command),
            };
        };
        const results = files.filter(keep).sort().map(calcResult);
        const previewCommand = (result) => {
            log(logName, chalk.blue.bold('preview:'), chalk.yellow(result.command));
        };
        const execCommand = (result) => {
            if (!settings.quiet)
                log(logName, chalk.blue.bold('command:'), chalk.cyanBright(result.command));
            const task = spawnSync(result.command, { shell: true, stdio: 'inherit' });
            recursiveExec.assert(task.status === 0, `Status: ${task.status}, Command: ${result.command}`);
        };
        results.forEach(settings.echo ? previewCommand : execCommand);
        const summary = `(files: ${results.length}, ${Date.now() - startTime}ms)`;
        if (!settings.quiet)
            log(logName, chalk.green('done'), chalk.white(summary));
        return results;
    },
};
export { recursiveExec };
