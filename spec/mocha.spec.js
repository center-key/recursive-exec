// recursive-exec
// Mocha Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import { cliArgvUtil } from 'cli-argv-util';
import assert from 'assert';
import fs     from 'fs';

// Setup
import { recursiveExec } from '../dist/recursive-exec.js';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

////////////////////////////////////////////////////////////////////////////////
describe('The "dist" folder', () => {

   it('contains the correct files', () => {
      const actual = fs.readdirSync('dist').sort();
      const expected = [
         'recursive-exec.d.ts',
         'recursive-exec.js',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Library module', () => {

   it('is an object', () => {
      const actual =   { constructor: recursiveExec.constructor.name };
      const expected = { constructor: 'Object' };
      assertDeepStrictEqual(actual, expected);
      });

   it('has a function named find()', () => {
      const module = recursiveExec;
      const actual = Object.keys(module).sort().map(key => [key, typeof module[key]]);
      const expected = [
         ['find', 'function'],
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Calling recursiveExec.find()', () => {

   it('for HTML and LESS files returns an array listing the correct files', () => {
      const folder =  'spec/fixtures/source';
      const command = 'glob {{file}}';
      const actual = recursiveExec.find(folder, command, { extensions: ['.html', '.less'] });
      const expected = [
         {
            basename: 'mock-file1',
            command:  'glob spec/fixtures/source/mock-file1.html',
            file:     'spec/fixtures/source/mock-file1.html',
            filename: 'mock-file1.html',
            folder:   'spec/fixtures/source',
            name:     'mock-file1',
            path:     '',
            },
         {
            basename: 'mock-file1',
            command:  'glob spec/fixtures/source/mock-file1.less',
            file:     'spec/fixtures/source/mock-file1.less',
            filename: 'mock-file1.less',
            folder:   'spec/fixtures/source',
            name:     'mock-file1',
            path:     '',
            },
         {
            basename: 'subfolder/mock-file2',
            command:  'glob spec/fixtures/source/subfolder/mock-file2.html',
            file:     'spec/fixtures/source/subfolder/mock-file2.html',
            filename: 'subfolder/mock-file2.html',
            folder:   'spec/fixtures/source',
            name:     'mock-file2',
            path:     'subfolder',
            },
         {
            basename: 'subfolder/mock-file2',
            command:  'glob spec/fixtures/source/subfolder/mock-file2.less',
            file:     'spec/fixtures/source/subfolder/mock-file2.less',
            filename: 'subfolder/mock-file2.less',
            folder:   'spec/fixtures/source',
            name:     'mock-file2',
            path:     'subfolder',
            },
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Correct error is thrown', () => {

   it('when the "source" folder is missing', () => {
      const makeBogusCall = () => recursiveExec.find();
      const exception =     { message: '[recursive-exec] Must specify the folder path.' };
      assert.throws(makeBogusCall, exception);
      });

   it('when the "command" template is missing', () => {
      const makeBogusCall = () => recursiveExec.find('spec');
      const exception =     { message: '[recursive-exec] Command template missing.' };
      assert.throws(makeBogusCall, exception);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Executing the CLI', () => {
   const run = (posix) => cliArgvUtil.run(pkg, posix);

   it('to compile LESS files to CSS preserves the source folder structure', () => {
      run("recursive-exec spec/fixtures/source --ext=.less 'lessc {{file}} spec/fixtures/target/css/{{basename}}.css'");
      const actual = cliArgvUtil.readFolder('spec/fixtures/target/css');
      const expected = [
         'mock-file1.css',
         'subfolder',
         'subfolder/mock-file2.css',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('to optimize CSS files preserves the source folder structure', () => {
      run("recursive-exec spec/fixtures/source --ext=.js 'make-dir spec/fixtures/target/css-min/{{path}}' --quiet");
      run("recursive-exec spec/fixtures/target/css 'csso {{file}} --output spec/fixtures/target/css-min/{{basename}}.min.css'");
      const actual = cliArgvUtil.readFolder('spec/fixtures/target/css-min');
      const expected = [
         'mock-file1.min.css',
         'subfolder',
         'subfolder/mock-file2.min.css',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('to minimize JS files preserves the source folder structure', () => {
      run("recursive-exec spec/fixtures/source --ext=.js --quiet 'make-dir spec/fixtures/target/js/{{path}}'");
      run("recursive-exec spec/fixtures/source --ext=.js 'uglifyjs {{file}} --output spec/fixtures/target/js/{{basename}}.min.js'");
      const actual = cliArgvUtil.readFolder('spec/fixtures/target/js');
      const expected = [
         'mock-file1.min.js',
         'subfolder',
         'subfolder/mock-file2.min.js',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('to rename copies of files with camel case names preserves the source folder structure', () => {
      const template = 'copy-file {{file}} spec/fixtures/target/html/{{path}}/{{name}}.{{nameCamelCase}}.html';
      run(`recursive-exec spec/fixtures/source --ext=.html --echo '${template}'`);
      run(`recursive-exec spec/fixtures/source --ext=.html '${template}'`);
      const actual = cliArgvUtil.readFolder('spec/fixtures/target/html');
      const expected = [
         'mock-file1.mockFile1.html',
         'subfolder',
         'subfolder/mock-file2.mockFile2.html',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('with the --exclude flag skips over the excluded files', () => {
      const template = 'copy-file {{file}} spec/fixtures/target/exclude/{{filename}}';
      run(`recursive-exec spec/fixtures/source --exclude=file1,html '${template}'`);
      const actual = cliArgvUtil.readFolder('spec/fixtures/target/exclude');
      const expected = [
         'subfolder',
         'subfolder/mock-file2.js',
         'subfolder/mock-file2.less',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
