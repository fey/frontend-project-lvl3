import onChange from 'on-change';
import {
  FILLING,
  SUBMITTED,
  SUBMITTING,
  FAILED,
} from './consts.js';

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

const handleForm = (stateValue) => {
  const input = document.getElementById('form-url');
  const submit = document.getElementsByName('submit');
  input.classList.remove('is-invalid');

  switch (stateValue) {
    case FILLING:
    case SUBMITTED:
      submit.disabled = false;
      input.value = '';
      break;
    case SUBMITTING:
      submit.disabled = true;
      break;
    case FAILED:
      input.classList.add('is-invalid');
      break;
    default:
      throw Error(`Unknown state: ${stateValue}`);
  }
};

const renderFeeds = (feeds) => {
  if (feeds.length === 0) {
    return;
  }

  const feedsContainer = document.getElementById('feeds');
  feedsContainer.innerHTML = '';

  const listTitle = document.createElement('h2');
  listTitle.textContent = 'Feeds';
  const feedsList = buildFeedList(feeds);

  feedsContainer.append(listTitle, feedsList);
};

const renderPosts = (posts) => {
  if (posts.length === 0) {
    return;
  }

  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';

  const postsTitle = document.createElement('h2');
  postsTitle.textContent = 'Posts';
  const postsList = buildPostsList(posts);

  postsContainer.append(postsTitle, postsList);
};

const renderMessage = ({ type, text }) => {
  const submit = document.getElementById('form-submit');
  let feedback = document.getElementById('form-message');

  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'form-message';
    feedback.classList.add('feedback');
  }

  switch (type) {
    case 'success':
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
      break;
    case 'error':
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;
    default:
      feedback.remove();
      return;
  }
  feedback.textContent = text;
  submit.after(feedback);
};

const render = (state, path, value) => {
  console.log(onChange.target(state));
  switch (path) {
    case 'form.state':
      handleForm(value);
      break;
    case 'form.message':
      renderMessage(value);
      break;
    case 'feeds':
      renderFeeds(value);
      break;
    case 'posts':
      renderPosts(value);
      break;
    default:
      break;
  }
};

export default render;
