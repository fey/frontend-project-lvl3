const parse = (data) => {
  console.log(data);
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'application/xml');
  return dom;
};

export default parse;
