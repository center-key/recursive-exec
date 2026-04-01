// recursive-exec
// CLI Specification Suite

// Imports
import { assertDeepStrictEqual, fixEolGitDiff } from 'assert-deep-strict-equal';
import { cliArgvUtil } from 'cli-argv-util';
import fs from 'node:fs';

// Setup
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const run = (posix) => cliArgvUtil.run(pkg, posix);

////////////////////////////////////////////////////////////////////////////////
describe('Executing the CLI', () => {

   it('to compile LESS files to CSS preserves the source folder structure', () => {
      run("recursive-exec spec/fixtures --ext=.less 'lessc {{file}} spec/target/css/{{basename}}.css'");
      const actual = cliArgvUtil.readFolder('spec/target/css');
      const expected = [
         'mock-file1.css',
         'subfolder',
         'subfolder/mock-file2.css',
         ];
      assertDeepStrictEqual(actual, expected);
      fixEolGitDiff('spec/target/css/mock-file1.css');
      fixEolGitDiff('spec/target/css/subfolder/mock-file2.css');
      });

   it('to optimize CSS files preserves the source folder structure', () => {
      run("recursive-exec spec/fixtures --ext=.js 'make-dir spec/target/css-min/{{path}}' --quiet");
      run("recursive-exec spec/target/css 'csso {{file}} --output spec/target/css-min/{{basename}}.min.css'");
      const actual = cliArgvUtil.readFolder('spec/target/css-min');
      const expected = [
         'mock-file1.min.css',
         'subfolder',
         'subfolder/mock-file2.min.css',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('to minimize JS files preserves the source folder structure', () => {
      run("recursive-exec spec/fixtures --ext=.js --quiet 'make-dir spec/target/js/{{path}}'");
      run("recursive-exec spec/fixtures --ext=.js 'uglifyjs {{file}} --output spec/target/js/{{basename}}.min.js'");
      const actual = cliArgvUtil.readFolder('spec/target/js');
      const expected = [
         'mock-file1.min.js',
         'subfolder',
         'subfolder/mock-file2.min.js',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('with a package.json command macro for the previous specification produces the same result', () => {
      run("recursive-exec spec/fixtures --ext=.js --quiet {{command:make-dir}}");
      run("recursive-exec spec/fixtures --ext=.js {{command:uglifyjs}}");
      const actual = cliArgvUtil.readFolder('spec/target/js-macro');
      const expected = [
         'mock-file1.min.js',
         'subfolder',
         'subfolder/mock-file2.min.js',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('to rename copies of files with camel case names preserves the source folder structure', () => {
      const template = 'copy-file {{file}} spec/target/html/{{path}}/{{name}}.{{nameCamelCase}}.html';
      run(`recursive-exec spec/fixtures --ext=.html --echo '${template}'`);
      run(`recursive-exec spec/fixtures --ext=.html '${template}'`);
      const actual = cliArgvUtil.readFolder('spec/target/html');
      const expected = [
         'mock-file1.mockFile1.html',
         'subfolder',
         'subfolder/mock-file2.mockFile2.html',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('with the --exclude flag skips over the excluded files', () => {
      const template = 'copy-file {{file}} spec/target/exclude/{{filename}}';
      run(`recursive-exec spec/fixtures --exclude=file1,html '${template}'`);
      const actual = cliArgvUtil.readFolder('spec/target/exclude');
      const expected = [
         'subfolder',
         'subfolder/mock-file2.js',
         'subfolder/mock-file2.less',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
