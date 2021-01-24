import '@testing-library/jest-dom';
import { screen } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';
// import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';
import init from '../src/init.js';

// const userEvent = testingLibraryUserEvent.default;

nock.disableNetConnect();

beforeEach(() => {
  const pathToFixture = path.join(__dirname, '..', 'index.html');
  const initHtml = fs.readFileSync(pathToFixture).toString();
  document.body.innerHTML = initHtml;
  init();

  // elements = {
  //   submit: getByText('Add'),
  //   urlInput: getByRole('textbox', { name: /url-form/ }),
  // };
});
test('it works', async () => {
  expect(screen.getByText('RSS Reader', { selector: 'h1' })).toBeInTheDocument();
  expect(screen.queryByText('Start reading RSS today! It is easy, it is nicely.')).toBeInTheDocument();
  expect(screen.getByText(/Add/)).not.toBeDisabled();
});
