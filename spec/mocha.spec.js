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

   it('has a find() function', () => {
      const actual =   { validate: typeof recursiveExec.find };
      const expected = { validate: 'function' };
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
            basename: 'mock1',
            command:  'glob spec/fixtures/source/mock1.html',
            file:     'spec/fixtures/source/mock1.html',
            filename: 'mock1.html',
            folder:   'spec/fixtures/source',
            path:     '',
            },
         {
            basename: 'mock1',
            command:  'glob spec/fixtures/source/mock1.less',
            file:     'spec/fixtures/source/mock1.less',
            filename: 'mock1.less',
            folder:   'spec/fixtures/source',
            path:     '',
            },
         {
            basename: 'subfolder/mock2',
            command:  'glob spec/fixtures/source/subfolder/mock2.html',
            file:     'spec/fixtures/source/subfolder/mock2.html',
            filename: 'subfolder/mock2.html',
            folder:   'spec/fixtures/source',
            path:     'subfolder',
            },
         {
            basename: 'subfolder/mock2',
            command:  'glob spec/fixtures/source/subfolder/mock2.less',
            file:     'spec/fixtures/source/subfolder/mock2.less',
            filename: 'subfolder/mock2.less',
            folder:   'spec/fixtures/source',
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
      run('recursive-exec spec/fixtures/source --ext=.less "lessc {{file}} spec/fixtures/target/css/{{basename}}.css"');
      const actual = fs.readdirSync('spec/fixtures/target/css', { recursive: true }).sort();
      const expected = [
         'mock1.css',
         'subfolder',
         'subfolder/mock2.css',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('to optimize CSS files preserves the source folder structure', () => {
      run('recursive-exec spec/fixtures/source --ext=.js "make-dir spec/fixtures/target/css-min/{{path}}" --quiet');
      run('recursive-exec spec/fixtures/target/css "csso {{file}} --output spec/fixtures/target/css-min/{{basename}}.min.css"');
      const actual = fs.readdirSync('spec/fixtures/target/css-min', { recursive: true }).sort();
      const expected = [
         'mock1.min.css',
         'subfolder',
         'subfolder/mock2.min.css',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('to minimize JS files preserves the source folder structure', () => {
      run('recursive-exec spec/fixtures/source --ext=.js --quiet "make-dir spec/fixtures/target/js/{{path}}"');
      run('recursive-exec spec/fixtures/source --ext=.js "uglifyjs {{file}} --output spec/fixtures/target/js/{{basename}}.min.js"');
      const actual = fs.readdirSync('spec/fixtures/target/js', { recursive: true }).sort();
      const expected = [
         'mock1.min.js',
         'subfolder',
         'subfolder/mock2.min.js',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
