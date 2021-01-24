/* eslint-disable jest/expect-expect */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';
import userEvent from '@testing-library/user-event'
import nock from 'nock';
import init from '../src/init.js';
import { PROXY_URL } from '../src/constants.js';

nock.disableNetConnect();
// let elements;

beforeEach(async () => {
  const pathToFixture = path.join(__dirname, '..', 'index.html');
  const initHtml = fs.readFileSync(pathToFixture).toString();
  document.body.innerHTML = initHtml;
  await init();
});

test('should work', async () => {
  expect(screen.getByText('RSS Reader', { selector: 'h1' })).toBeInTheDocument();
  expect(screen.queryByText('Start reading RSS today! It is easy, it is nicely.')).toBeInTheDocument();
  expect(screen.getByText(/Add/)).not.toBeDisabled();
});

test('submit url should work', async () => {
  const scope = nock('hexlet-allorigins.herokuapp.com')
    .get('/get') //{ url: 'https://ru.hexlet.io/lessons.rss', disableCache: true })
    .reply(200);
    // .replyWithFile(200, path.join(__dirname, '__fixtures__', 'lessons.rss'), {
    //   'Content-type': 'application/rss+xml; charset=utf-8',
    // });

  const urlElement = screen.getByRole('textbox', { selector: '#form-url' });
  const submitElement = screen.getByText(/Add/);

  await userEvent.type(urlElement, 'https://ru.hexlet.io/lessons.rss');
  userEvent.click(submitElement);
  expect(submitElement).toBeDisabled();

  await waitFor(() => {
    expect(document.body).toHaveTextContent('Rss has been loaded');
  });

  scope.done();
});
