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

export default validate;
