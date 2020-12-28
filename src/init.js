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

const parse = (data) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(data, 'text/xml');

  return content;
};

const render = (state) => {
  const form = document.getElementById('rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const error = validate(formData.get('url'));
    console.log(error);
    if (error) {
      state.form.state = 'invalid';
      state.form.error = error;

      return;
    }

    state.form.state = 'valid';

    const url = formData.get('url');
    const requestUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    state.button.disabled = true;
    Axios.get(requestUrl)
      .then((res) => {
        console.log(parse(res.data.contents));
        state.button.disabled = false;
        // console.log(`${res.data}`);
        // console.log(parse(res.data));
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
    // input.classList.add('is-valid');
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
