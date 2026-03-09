// recursive-exec
// Error Handling Specification Suite

// Imports
import assert from 'assert';

// Setup
import { recursiveExec } from '../dist/recursive-exec.js';

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
