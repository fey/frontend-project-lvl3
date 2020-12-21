import onChange from 'on-change';
import * as yup from 'yup';

const validate = (url) => {
  const schema = yup.string().url().required();
  console.log('validationg');
  try {
    schema.validateSync(url);
    return {};
  } catch (e) {
    const [error] = e.errors;
    return error;
  }
};


const render = (state) => {
  const form = document.getElementById('rss-form');

  if (state.form.state === 'invalid') {
    const input = form.getElementById('form-url');
    input.classList.add('is-invalid');
  }
};

const state = {
  form: {
    errors: {},
    state: 'valid', // invalid
    url: '',
  },
  feeds: [],
};
const watchedState = onChange(state, (path, value) => {
  console.log(state);
  render(state);
});

export default () => {
  const form = document.getElementById('rss-form');

  form.addEventListener('keyup', (e) => {
    e.preventDefault();
    watchedState.form.url = e.target.value;
    watchedState.form.errors = validate(e.target.value);
    if (watchedState.form.errors.length) {
      watchedState.form.state = 'invalid';
    }
  });
  console.log(form);
};
