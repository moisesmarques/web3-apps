import * as yup from 'yup';

export const createNFTValidation = yup.object().shape({
  title: yup
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .matches(/^[^\s][a-zA-Z0-9-_]+[a-zA-Z0-9-_\s;&!@#$]+$/, 'Title cannot contain special characters')
    .required('Title is required'),
  description: yup
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters')
    .matches(/^[a-zA-Z0-9-_]+[a-zA-Z0-9-_\s;&!@$]+$/, 'Description cannot contain special characters')
    .required('Description is required'),
  // category: yup.string().required('Category is required'),
});
