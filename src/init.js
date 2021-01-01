import Axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import parse from './parser';

const validate = (url) => {
  const schema = yup.string().url().required();
  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    const [error] = e.errors;
    return error;
  }
};

const buildFeedList = (feeds) => {
  const buildFeedListItem = (feed) => {
    const li = document.createElement('li');
    const h2 = document.createElement('h3');
    const p = document.createElement('p');

    li.classList.add('list-group-item');
    li.append(h2, p);
    h2.textContent = feed.title;
    p.textContent = feed.description;

    return li;
  };

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');
  feeds.forEach((feed) => {
    const feedEl = buildFeedListItem(feed);
    ul.append(feedEl);
  });

  return ul;
};

const buildPostsList = (posts) => {
  const buildItem = (post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const link = document.createElement('a');
    link.classList.add(post.isRead ? 'fw-normal' : 'fw-bold');
    link.href = post.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.textContent = 'Preview';

    li.append(link, button);

    return li;
  };

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach((post) => {
    ul.append(buildItem(post));
  });

  return ul;
};

const render = (state) => {
  const input = document.getElementById('form-url');
  const feedback = document.querySelector('form > .invalid-feedback') ?? document.createElement('div');
  input.classList.remove('is-invalid');
  const submit = document.querySelector('input[type="submit"]');
  submit.disabled = state.button.disabled;

  if (feedback) {
    feedback.remove();
  }

  if (state.form.state === 'invalid') {
    feedback.classList.add('invalid-feedback');
    feedback.textContent = state.form.error;
    input.after(feedback);
    input.classList.add('is-invalid');
  }

  const feedsContainer = document.getElementById('feeds');
  feedsContainer.innerHTML = '';

  if (state.feeds.length !== 0) {
    const listTitle = document.createElement('h2');
    listTitle.textContent = 'Feeds';
    const feedsList = buildFeedList(state.feeds);
    feedsContainer.append(listTitle, feedsList);
  }

  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';

  if (state.feeds.length !== 0) {
    const postsTitle = document.createElement('h2');
    postsTitle.textContent = 'Posts';
    const postsList = buildPostsList(state.posts);

    postsContainer.append(postsTitle, postsList);
  }
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
    const requestUrl = 'https://api.allorigins.win/get';
    watchedState.button.disabled = true;
    Axios.get(requestUrl, {
      params: {
        url,
      },
    })
      .then((res) => {
        const { feed, posts } = parse(res.data.contents);
        watchedState.feeds = [feed, ...watchedState.feeds];
        watchedState.posts = [...posts, ...watchedState.posts];
        watchedState.button = { disabled: false };
      });
  });

  render(watchedState);
};
