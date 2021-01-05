import { get } from 'axios';
import onChange from 'on-change';
import i18next from 'i18next';
import { sha1 } from 'object-hash';
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
    const hash = sha1(JSON.stringify({ title, description, link }));

    return {
      title, description, link, hash,
    };
  };
  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent.trim();
  const posts = [];

  rss.querySelectorAll('channel > item').forEach((item) => {
    posts.push(convertItem(item));
  });

  return { feed: { title, description, url }, posts };
};

const loadPosts = (state, feed) => {
  const { url } = feed;
  get('https://api.allorigins.win/raw', { params: { url } })
    .then((res) => {
      const parsed = parse(res.data);
      const { posts } = buildFeed(parsed, url);
      const newPosts = posts.filter((post) => {
        const exists = state.posts.find((storedPost) => storedPost.hash === post.hash);

        return Boolean(!exists);
      });

      if (newPosts.length === 0) {
        return;
      }

      console.log(newPosts);
      state.posts = [...newPosts, ...state.posts];
    });
  setTimeout(() => loadPosts(state, feed), 5000);
};

export default () => i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    ru: {
      translation: {
        title: 'RSS Reader',
        subtitle: 'Начните читать RSS уже сегодня! Это легко, это приятно.',
        preview: 'Предпросмотр',
        feeds: 'Потоки',
        posts: 'Посты',
        add: 'Добавить',
        exists: 'Поток уже добавлен',
        success_load: 'Поток загружен',
        must_be_url: 'должен быть действительный URL-адрес',
        something_went_wrong: 'Упс, что-то пошло не так',

      },
    },
    en: {
      translation: {
        title: 'RSS Reader',
        subtitle: 'Start reading RSS today! It is easy, it is nicely.',
        preview: 'Preview',
        feeds: 'Feeds',
        posts: 'Posts',
        add: 'Add',
        exists: 'RSS already exists',
        success_load: 'Rss has been loaded',
        must_be_url: '{{value}} must be a valid URL',
        something_went_wrong: 'Something went wrong',
      },
    },
  },
}).then(() => {
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
    readedPosts: [],
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
        text: 'exists',
      };

      return;
    }

    get('https://api.allorigins.win/raw', { params: { url } })
      .then((res) => {
        const parsed = parse(res.data);
        const { feed, posts } = buildFeed(parsed, url);
        watchedState.feeds = [feed, ...watchedState.feeds];
        watchedState.posts = [...posts, ...watchedState.posts];
        watchedState.form.state = SUBMITTED;
        watchedState.form.message = {
          type: 'success',
          text: 'success_load',
        };

        setTimeout(() => loadPosts(watchedState, feed), 5000);
      })
      .catch((error) => {
        watchedState.form.state = FAILED;
        watchedState.form.message = {
          type: 'error',
          text: error,
          // text: 'something_went_wrong',
        };
      });
  });

  render(watchedState);
});
