import { useRouter } from 'next/router';

import React, { useState, useEffect } from 'react';

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';

import { ArrowRight } from '@/assets/svg/arrow-right';
import Button from '@/components/core/Button';
import Input from '@/components/core/FieldInput';
import { DivPhoneInput, InputCountryCode, InputPhoneNumber } from '@/components/core/PhoneInput/PhoneInput.style';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import SignUpFooter from '@/components/Footer/SignUpFooter';
import FullscreenLoader from '@/components/FullscreenLoader';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { setUser, getAuthDataSelector } from '@/store/auth';
import { signupValidation } from '@/validations';

import { DivStylesFormStyles, DivStyled, DivPhoneInputContainer, DivEmail } from './index.styles';
import { SignUpFormProps, FormValues } from './index.type';
const SignupForm = ({ type }: SignUpFormProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { otpVerified } = useAppSelector(getAuthDataSelector);
  const [redirect, setRedirect] = useState<boolean>(false);
  const [snackBarvisible, setSnackBarvisible] = useState<boolean>(false);
  const [snackBarmessage, setSnackBarmessage] = useState<string>('');

  useEffect(() => {
    if (otpVerified) {
      router.push('/all-nfts');
    }
  }, []);

  const onFormSubmit = (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    if (type == 'email') {
      setSubmitting(true);
      dispatch(
        setUser({
          email: values.email,
          phone: values.phone,
          type,
          accountId: '',
        })
      );
      setRedirect(true);
    } else if (type == 'phone') {
      if (values.countryCode == '') {
        setSubmitting(false);
        setSnackBarvisible(true);
        setSnackBarmessage('Country Code is required');
        return;
      } else {
        setSubmitting(true);
        dispatch(
          setUser({
            email: values.email,
            phone: values.phone,
            countryCode: values.countryCode,
            type,
            accountId: '',
          })
        );
        setRedirect(true);
      }
    }
  };

  if (redirect) {
    router.push('/signup/create-account');
  }

  const setPhoneNumber = (number: any) => number.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
  const setCountry = (number: any) => {
    const num = number.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    return num ? `+${num}` : '';
  };
  return (
    <DivStylesFormStyles data-testid="signup-form">
      <Formik
        initialValues={{
          email: '',
          phone: '',
          countryCode: '',
        }}
        validationSchema={() => signupValidation(type)}
        onSubmit={onFormSubmit}
      >
        {({ errors, touched, isValid, dirty, setFieldValue, isSubmitting }) => {
          return (
            <Form>
              {isSubmitting && <FullscreenLoader />}
              {type === 'email' ? (
                <DivEmail>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    placeholder="johndoe@example.com"
                    error={errors.email && touched.email}
                    helperText={<ErrorMessage name="email" />}
                    data-testid="email-input"
                  />
                </DivEmail>
              ) : (
                <DivPhoneInputContainer data-testid="phone-input">
                  <DivPhoneInput>
                    <InputCountryCode
                      name="countryCode"
                      maxLength={4}
                      onChange={(e: any) => setFieldValue('countryCode', setCountry(e.target.value))}
                      error={errors.countryCode && touched.countryCode}
                      placeholder={'+1'}
                    />
                    <InputPhoneNumber
                      name="phone"
                      maxLength={12}
                      onChange={(e: any) => setFieldValue('phone', setPhoneNumber(e.target.value))}
                      error={errors.phone && touched.phone}
                      placeholder={'Ex. 3373788383'}
                    />
                  </DivPhoneInput>
                </DivPhoneInputContainer>
              )}
              <DivStyled>
                <Button disabled={!(dirty && isValid)} type="submit" data-testid={`${type}-continue-button`}>
                  Continue
                  <ArrowRight />
                </Button>
              </DivStyled>
              <SignUpFooter />
            </Form>
          );
        }}
      </Formik>
      <SnackBar
        type={SnackBarType.ERROR}
        visible={snackBarvisible}
        setVisible={setSnackBarvisible}
        content={snackBarmessage}
      />
    </DivStylesFormStyles>
  );
};

export default SignupForm;
