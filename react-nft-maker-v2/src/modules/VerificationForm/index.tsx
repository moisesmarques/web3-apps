import React, { useEffect } from 'react';

import { CircularProgress } from '@mui/material';
import { Field, Form, Formik, FormikHelpers } from 'formik';

import { ArrowRight } from '@/assets/svg/arrow-right';
import Button from '@/components/core/Button';
import Input from '@/components/core/FieldInput';
import VerificationFooter from '@/components/Footer/VerificationFooter';
import { useAppSelector, useAppDispatch } from '@/hooks/useReduxTypedHooks';
import { clearError, getAuthDataSelector, setOtp } from '@/store/auth';
import { IVerificationRequest } from '@/store/auth/types';
import { authenticateOtpSchema } from '@/validations';

import { DivLoaderContainer, StylesFormStyles } from './index.styles';
import { FormValues } from './index.type';

interface IProps {
  onSubmit: (data: IVerificationRequest) => void;
  setLoading?: (loading: boolean) => void;
  loading?: boolean;
}

const VerificationForm = ({ onSubmit, setLoading }: IProps) => {
  const dispatch = useAppDispatch();
  const { user, error } = useAppSelector(getAuthDataSelector);

  const array = [2, 4, 6, 8, 10, 12];

  /**
   * Submit form handler.
   * @param values user object
   * @param param1 formik helper
   */
  const onFormSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    setSubmitting(true);
    if (setLoading) {
      setLoading(true);
    }
    dispatch(setOtp(Object.values(values).join('')));

    const data = {
      code: Object.values(values).join(''),
      accountId: user.accountId,
    };

    onSubmit(data);
  };

  // Use to focus the next OTP input field`
  const inputFocus = (element: any) => {
    if (element.key === 'Tab' || element.key === 'Shift') {
      return;
    } else if (element.key === 'Delete' || element.key === 'Backspace') {
      const next = array[element.target.id] - 4;
      if (next > -1) {
        element.target.form.elements[next].focus();
      }
    } else {
      const next = array[element.target.id];
      if (next <= 12 && element.target.value !== '') {
        element.target.form.elements[next].focus();
      }
    }
  };

  // Use to make input max value one`
  const maxLengthOne = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 1);
  };

  // Use to paste and validate input
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, setFieldValue: any) => {
    const pastedValue = e.clipboardData.getData('Text').replace(/\D/g, '').split('') as [];
    pastedValue.forEach((value, ind) => {
      setFieldValue(`otp-${ind}`, value, false);
    });
  };

  useEffect(() => {
    if (error && error.length > 0) {
      dispatch(clearError());
      if (setLoading) {
        setLoading(false);
      }
    }
  }, [error, user]);

  return (
    <StylesFormStyles data-testid="verification-form">
      <Formik
        initialValues={{
          'otp-0': '',
          'otp-1': '',
          'otp-2': '',
          'otp-3': '',
          'otp-4': '',
          'otp-5': '',
        }}
        onSubmit={onFormSubmit}
        validationSchema={authenticateOtpSchema}
      >
        {({ isValid, dirty, setFieldValue, isSubmitting }) => (
          <Form>
            {isSubmitting && (
              <DivLoaderContainer>
                <CircularProgress className="loader" />
              </DivLoaderContainer>
            )}
            <div className="align-container">
              <p className="label">Enter verification code</p>
            </div>
            <div className="align-container">
              {array.map((arr, ind) => (
                <Field
                  id={ind.toString()}
                  as={Input}
                  inputProps={{ style: { textAlign: 'center' } }}
                  key={ind}
                  name={`otp-${ind}`}
                  className="input-field"
                  onKeyUp={inputFocus}
                  type="number"
                  onInput={maxLengthOne}
                  onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => handlePaste(e, setFieldValue)}
                />
              ))}
            </div>
            <div className="align-container">
              <Button disabled={!(dirty && isValid)} type="submit" data-testid="continue-button">
                <>
                  Continue <ArrowRight />
                </>
              </Button>
            </div>
            <VerificationFooter />
          </Form>
        )}
      </Formik>
    </StylesFormStyles>
  );
};

export default VerificationForm;
