// recursive-exec
// Mocha Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import assert from 'assert';
import fs     from 'fs';

// Setup
import { recursiveExec } from '../dist/recursive-exec.js';

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
