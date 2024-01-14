import { PhoneInputProps as ReactPhoneInputProps } from 'react-phone-input-2';

export type PhoneInputProps = {
  name: string;
  id?: string;
  placeholder?: string;
  type?: string;
  error?: boolean;
  errorBorder?: boolean;
  onChange: any;
} & ReactPhoneInputProps;
