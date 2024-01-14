import Link from 'next/link';
import { useRouter } from 'next/router';

import React, { useEffect, useState } from 'react';

import { InputAdornment } from '@mui/material';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';

import { ArrowRight } from '@/assets/svg/arrow-right';
import Button from '@/components/core/Button';
import Input from '@/components/core/FieldInput';
import Label from '@/components/core/Label';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import SignUpFooter from '@/components/Footer/SignUpFooter';
import FullscreenLoader from '@/components/FullscreenLoader';
import { ACCOUNT_ID_PREFIX } from '@/constants/api';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { DivCreateAccountSubtitle } from '@/pages/signup/create-account/index.styles';
import { clearError, getAuthDataSelector, signupUserThunk } from '@/store/auth';
import { doesAccountStringHaveValidCharacters, removeSpecialCharacters } from '@/utils/helper';
import { createAccountValidation } from '@/validations';

import { DivStyled } from '../SignupForm/index.styles';
import { DivStylesFormStyles } from './index.styles';
import { FormValues } from './index.type';

const CreateAccountForm = () => {
  const router = useRouter();
  const { user, error, token, status } = useAppSelector(getAuthDataSelector);
  const [visible, setVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const dispatch = useAppDispatch();

  const [accountId, setAccountId] = useState('');
  const [redirect, setRedirect] = useState<boolean>(false);

  const onAccountChange = (e: any) => {
    const { value } = e.target;

    if (!value || doesAccountStringHaveValidCharacters(value.toLowerCase())) {
      setAccountId(value.toLowerCase());
    }
  };
  const onFormSubmit = (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    setSubmitting(true);
    dispatch(
      signupUserThunk({
        email: user.email,
        phone: user?.phone ? user?.phone : undefined,
        countryCode: user?.phone ? user?.countryCode : undefined,
        type: user.type,
        fullName: values.fullName,
        accountId: accountId,
      })
    );
  };

  useEffect(() => {
    if (token) {
      setRedirect(true);
    }
  }, [token]);

  useEffect(() => {
    if (error && error.length > 0) {
      setVisible(true);
      setMessage(error);
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    if (user.type === 'email' && user.email) {
      setAccountId(user.email.split('@')[0].replace(removeSpecialCharacters, ''));
    } else if (user.type === 'phone' && user.phone) {
      setAccountId(user.phone.replace(/\D/g, ''));
    }
  }, [user]);

  if (redirect) {
    router.push('/all-nfts');
  }

  const getInitialValues = () => {
    if (user && user.type !== '') {
      if (user.type === 'email' && user.email) {
        return {
          fullName: '',
          accountId: user.email.split('@')[0],
        };
      } else if (user.type === 'phone' && user.phone) {
        return {
          fullName: '',
          accountId: user.phone.replace(/\D/g, ''),
        };
      }
    }
    return {
      fullName: '',
      accountId: '',
    };
  };

  return (
    <DivStylesFormStyles data-testid="create-account-form">
      <DivCreateAccountSubtitle>
        Enter an Account ID to use with your NEARApps ID account. Your Account ID will be used for all NEAR operations,
        including sending and receiving assets.
      </DivCreateAccountSubtitle>
      <Formik initialValues={getInitialValues()} validationSchema={createAccountValidation} onSubmit={onFormSubmit}>
        {({ errors, touched, dirty, isValid }) => (
          <Form>
            {status === 'loading' && <FullscreenLoader />}
            <Label htmlFor="fullName" className="label">
              FULL NAME
            </Label>
            <Field
              as={Input}
              id="fullName"
              disabled={status === 'loading'}
              name="fullName"
              placeholder="Ex John Doe"
              className="input"
              error={touched.fullName && errors.fullName ? true : false}
              helperText={<ErrorMessage name="fullName" />}
            />
            <Label htmlFor="accountId" className="label">
              ACCOUNT ID
            </Label>
            <Field
              as={Input}
              onChange={onAccountChange}
              value={accountId}
              disabled={status === 'loading'}
              id="accountId"
              name="accountId"
              className="input"
              placeholder={'yourname' + ACCOUNT_ID_PREFIX}
              error={touched.accountId && errors.accountId ? true : false}
              helperText={<ErrorMessage name="accounId" />}
              InputProps={{
                endAdornment: <InputAdornment position="end">{ACCOUNT_ID_PREFIX}</InputAdornment>,
              }}
            />
            <DivStyled>
              <Button disabled={!(dirty && isValid)} type="submit">
                Continue
                <ArrowRight />
              </Button>
            </DivStyled>
            <SignUpFooter
              customTermsAndConditionText={
                <>
                  By creating a NEAR account, you agree to the NEAR Wallet
                  <Link href="/"> Terms & Conditions</Link> and
                  <Link href="/"> Privacy Policy.</Link>
                </>
              }
            />
          </Form>
        )}
      </Formik>
      <SnackBar type={SnackBarType.ERROR} visible={visible} setVisible={setVisible} content={message} />
    </DivStylesFormStyles>
  );
};

export default CreateAccountForm;
