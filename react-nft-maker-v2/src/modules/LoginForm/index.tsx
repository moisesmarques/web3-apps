import Link from 'next/link';
import { useRouter } from 'next/router';

import React, { useState, useEffect } from 'react';

import { ChevronRight } from '@mui/icons-material';
import { Divider } from '@mui/material';
import { ErrorMessage, Field, Form, Formik } from 'formik';

import Button from '@/components/core/Button';
import Input from '@/components/core/FieldInput';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import FullscreenLoader from '@/components/FullscreenLoader';
import { ACCOUNT_ID_PREFIX } from '@/constants/api';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { clearError, getAuthDataSelector, loginUserThunk, setUser } from '@/store/auth';
import { resetOtpSent } from '@/store/auth/authSlice';
import { loginValidation } from '@/validations';

import {
  DivStylesFormStyles,
  DivStyled,
  StyledInputAdornment,
  StyledLabel,
  StyledText,
  DivSignUpLabel,
  StyledAlertText,
} from './index.styles';
import { FormValues } from './index.type';

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [snackBarvisible, setSnackBarvisible] = useState<boolean>(false);
  const [snackBarmessage, setSnackBarmessage] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { user, error, otpSent, otpVerified, isAuthenticated } = useAppSelector(getAuthDataSelector);
  const onFormSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const { accountId } = values;
    dispatch(setUser({ ...user, accountId }));

    dispatch(
      loginUserThunk({
        accountId,
      })
    );

    setTimeout(() => {
      if (!isAuthenticated) {
        setIsSubmitting(false);
      }
    }, 2000);
  };

  useEffect(() => {
    if (error && error.length > 0) {
      setSnackBarvisible(true);
      setSnackBarmessage(error);
      dispatch(clearError());
    } else if (otpVerified) {
      router.push('/all-nfts');
    } else if (otpSent) {
      router.push('/authenticate');
      dispatch(resetOtpSent());
    }
  }, [error, user, otpSent]);

  return (
    <DivStylesFormStyles data-testid="login-form">
      <Formik
        initialValues={{
          accountId: '',
        }}
        validationSchema={() => loginValidation}
        onSubmit={onFormSubmit}
      >
        {({ errors, touched, isValid, dirty }) => {
          return (
            <Form>
              <StyledLabel htmlFor="accountId">ACCOUNT ID</StyledLabel>
              {isSubmitting && <FullscreenLoader />}
              <Field
                as={Input}
                id="accountId"
                name="accountId"
                placeholder="john"
                error={errors.accountId && touched.accountId ? true : false}
                helperText={<ErrorMessage name="accountId" />}
                data-testid="account-id-input"
                InputProps={{
                  endAdornment: <StyledInputAdornment position="end">{ACCOUNT_ID_PREFIX}</StyledInputAdornment>,
                }}
              />
              <DivStyled>
                <Button className="btn-login" disabled={!(dirty && isValid)} type="submit" data-testid={`login-allow`}>
                  Next <ChevronRight />
                </Button>
              </DivStyled>
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
      <Divider />
      <StyledAlertText data-testid="footer-text-login">
        Only .near names created through PrimeLab are <br /> supported at this time for engineering and security
      </StyledAlertText>
      <DivStyled>
        <StyledText data-testid="footer-text-login">Don't have a NEARApps account?</StyledText>
      </DivStyled>
      <Link href="/signup">
        <DivSignUpLabel>Sign Up</DivSignUpLabel>
      </Link>
    </DivStylesFormStyles>
  );
};

export default LoginForm;
