const parse = (data) => {
  const parseItem = (item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;

    return { title, description, link };
  };
  const parser = new DOMParser();
  const content = parser.parseFromString(data, 'text/xml');

  const title = content.querySelector('channel > title').textContent;
  const description = content.querySelector('channel > description').textContent.trim();
  const posts = [];

  content.querySelectorAll('channel > item').forEach((item) => {
    posts.push(parseItem(item));
  });

  return { feed: { title, description }, posts };
};

export default parse;
