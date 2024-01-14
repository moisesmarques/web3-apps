import { Fragment } from 'react';

import FormHelperText from '@mui/material/FormHelperText';
import { ErrorMessage } from 'formik';
import PhoneNumberInput from 'react-phone-input-2';

import { PhoneInputProps } from './PhoneInput.types';

const PhoneInput = ({ onChange, error, name, id, ...props }: PhoneInputProps) => {
  return (
    <Fragment>
      <PhoneNumberInput
        country={'us'}
        onChange={onChange}
        containerClass="MuiTextField-root"
        inputClass="MuiTextField-input"
        buttonClass="MuiTextField-button"
        dropdownClass="MuiTextField-dropdown"
        inputProps={{
          name,
          id,
        }}
        {...props}
      />
      <FormHelperText error={error}>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/*// @ts-ignore*/}
        <ErrorMessage name={name} />
      </FormHelperText>
    </Fragment>
  );
};

export default PhoneInput;
