import { get } from 'axios';
import onChange from 'on-change';
import parse from './parser';
import validate from './validator';
import render from './render';

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
    button: {
      disabled: false,
    },
    form: {
      error: null,
      state: 'valid', // invalid
    },
    feeds: [],
    posts: [],
  };
  const watchedState = onChange(state, () => render(watchedState));

  const form = document.getElementById('rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const error = validate(formData.get('url'));
    if (error) {
      watchedState.form = {
        state: 'invalid',
        error,
      };

      return;
    }
    const url = formData.get('url');
    const alreadyExists = onChange.target(watchedState).feeds.find((feed) => feed.url === url);

    if (alreadyExists) {
      watchedState.form.error = 'Rss already exists';
      watchedState.form.state = 'invalid';
      return;
    }

    watchedState.button.disabled = true;
    get('https://api.allorigins.win/get', { params: { url } })
      .then((res) => {
        const parsed = parse(res.data.contents);
        const { feed, posts } = buildFeed(parsed, url);
        watchedState.feeds = [feed, ...watchedState.feeds];
        watchedState.posts = [...posts, ...watchedState.posts];
        watchedState.button = { disabled: false };
      });
  });

  render(watchedState);
};
