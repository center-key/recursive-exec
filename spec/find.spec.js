// recursive-exec
// Function find() Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';

// Setup
import { recursiveExec } from '../dist/recursive-exec.js';

////////////////////////////////////////////////////////////////////////////////
describe('Calling recursiveExec.find()', () => {

   it('for HTML and LESS files returns an array listing the correct files', () => {
      const folder =  'spec/fixtures';
      const command = 'glob {{file}}';
      const actual = recursiveExec.find(folder, command, { extensions: ['.html', '.less'] });
      const expected = [
         {
            basename: 'mock-file1',
            command:  'glob spec/fixtures/mock-file1.html',
            file:     'spec/fixtures/mock-file1.html',
            filename: 'mock-file1.html',
            folder:   'spec/fixtures',
            name:     'mock-file1',
            path:     '',
            },
         {
            basename: 'mock-file1',
            command:  'glob spec/fixtures/mock-file1.less',
            file:     'spec/fixtures/mock-file1.less',
            filename: 'mock-file1.less',
            folder:   'spec/fixtures',
            name:     'mock-file1',
            path:     '',
            },
         {
            basename: 'subfolder/mock-file2',
            command:  'glob spec/fixtures/subfolder/mock-file2.html',
            file:     'spec/fixtures/subfolder/mock-file2.html',
            filename: 'subfolder/mock-file2.html',
            folder:   'spec/fixtures',
            name:     'mock-file2',
            path:     'subfolder',
            },
         {
            basename: 'subfolder/mock-file2',
            command:  'glob spec/fixtures/subfolder/mock-file2.less',
            file:     'spec/fixtures/subfolder/mock-file2.less',
            filename: 'subfolder/mock-file2.less',
            folder:   'spec/fixtures',
            name:     'mock-file2',
            path:     'subfolder',
            },
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
