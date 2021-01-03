import { get } from 'axios';
import onChange from 'on-change';
import parse from './parser';
import validate from './validator';
import render from './render';
import {
  FILLING,
  SUBMITTED,
  SUBMITTING,
  FAILED,
} from './consts.js';

const buildFeed = (rss, url) => {
  const convertItem = (item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;

    return { title, description, link };
  };
  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent.trim();
  const posts = [];

  rss.querySelectorAll('channel > item').forEach((item) => {
    posts.push(convertItem(item));
  });

  return { feed: { title, description, url }, posts };
};

export default () => {
  const state = {
    form: {
      message: {
        type: null,
        text: '',
      },
      state: FILLING,
      /**
       * filling
        -> submitted
        -> submitting
        -> failed
       */
    },
    feeds: [],
    posts: [],
  };
  const watchedState = onChange(state, (path, value) => render(watchedState, path, value));
  const form = document.getElementById('rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.state = SUBMITTING;

    const formData = new FormData(e.target);
    const validationMessage = validate(formData.get('url'));

    if (validationMessage) {
      watchedState.form.state = FAILED;
      watchedState.form.message = {
        type: 'error',
        text: validationMessage,
      };

      return;
    }

    const url = formData.get('url');
    const alreadyExists = state.feeds.find((feed) => feed.url === url);

    if (alreadyExists) {
      watchedState.form.state = FAILED;
      watchedState.form.message = {
        type: 'error',
        text: 'RSS already exists',
      };

      return;
    }

    get('https://api.allorigins.win/get', { params: { url } })
      .then((res) => {
        const parsed = parse(res.data.contents);
        const { feed, posts } = buildFeed(parsed, url);
        watchedState.feeds = [feed, ...watchedState.feeds];
        watchedState.posts = [...posts, ...watchedState.posts];
        watchedState.form.state = SUBMITTED;
        watchedState.form.message = {
          type: 'success',
          text: 'Rss has been loaded',
        };
      })
      .catch((error) => {
        watchedState.form.state = FAILED;
        watchedState.form.message = {
          type: 'error',
          text: error,
        };
      });
  });

  render(watchedState);
};
