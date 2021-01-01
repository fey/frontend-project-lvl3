import Axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';

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

const convertItem = (item) => {
  const title = item.querySelector('title').textContent;
  const link = item.querySelector('link').textContent;
  const description = item.querySelector('description').textContent;

  return { title, description, link };
};

const parse = (data) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(data, 'text/xml');
  console.log(content);
  const title = content.querySelector('channel > title').textContent;
  const description = content.querySelector('channel > description').textContent.trim();
  const posts = [];

  content.querySelectorAll('channel > item').forEach((item) => {
    posts.push(convertItem(item));
  });

  return { title, description, posts };
};

const render = (state) => {
  const form = document.getElementById('rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const error = validate(formData.get('url'));
    if (error) {
      state = {
        ...state,
        form: {
          state: 'invalid',
          error,
        },
      };

      return;
    }
    const url = formData.get('url');
    const requestUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    state.button.disabled = true;
    Axios.get(requestUrl)
      .then((res) => {
        const feed = parse(res.data.contents);
        state = {
          ...state,
          feeds: [...state.feeds, feed],
          button: { disabled: false },
        };
      });
  });

  if (state.form.state === 'invalid') {
    const input = document.getElementById('form-url');
    const feedback = document.createElement('div');
    feedback.classList.add('invalid-feedback');
    feedback.textContent = state.form.error;
    input.after(feedback);
    input.classList.add('is-invalid');
  }

  if (state.form.state === 'valid') {
    const feedback = document.querySelector('form > .invalid-feedback');
    const input = document.getElementById('form-url');
    input.classList.remove('is-invalid');
    if (feedback) {
      feedback.remove();
    }
  }
};

export default () => {
  const state = {
    button: {
      disabled: false,
    },
    form: {
      errors: null,
      state: 'valid', // invalid
    },
    feeds: [],
  };

  const watchedState = onChange(state, () => render(watchedState));

  render(watchedState);
};
