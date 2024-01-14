import { ChangeEventHandler } from 'react';

import { TextFieldProps } from '@mui/material/TextField';

export type IInputProps = {
  name: string;
  id?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  className?: string;
  placeholder?: string;
  type?: string;
  InputProps?: any;
} & TextFieldProps;
