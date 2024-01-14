import { Fragment, memo, useState, useEffect } from 'react';

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';

import Input from '@/components/core/FieldInput';
import { DivPhoneInput, InputCountryCode, InputPhoneNumber } from '@/components/core/PhoneInput/PhoneInput.style';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import FullscreenLoader from '@/components/FullscreenLoader';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getAuthDataSelector } from '@/store/auth';
import { deleteUserThunk } from '@/store/auth/authSlice';
import { signupValidation } from '@/validations/signup';

import { DivEmail, DivPhoneInputContainer } from '../SignupForm/index.styles';
import { FormValues } from '../SignupForm/index.type';
import { ButtonOptions, ButtonSubmit, DivButtonContainer, StyledContent } from './DeleteAccount.stytles';

enum SIGNUP_FORM_TYPE {
  PHONE = 'phone',
  EMAIL = 'email',
}

const DeleteAccount = memo(({ onFormSubmission }: { onFormSubmission: any }) => {
  const dispatch = useAppDispatch();
  const { user: currentUser, token, deleteOtpSent } = useAppSelector(getAuthDataSelector);
  const [type, setType] = useState<string>(SIGNUP_FORM_TYPE.PHONE);
  const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');

  const [user, setUser] = useState({
    email: '',
    phone: '',
    type,
    countryCode: '',
  });

  const activeClassName = 'btn-signup-active';

  useEffect(() => {
    if (deleteOtpSent) {
      onFormSubmission();
    }
  }, [deleteOtpSent]);

  const handleButtonClick = (e: any) => {
    setType(e.target.name);
    setUser({
      email: '',
      phone: '',
      type,
      countryCode: '',
    });
  };

  const onFormSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    if (
      (type === 'email' && user.email !== currentUser.email) ||
      (type === 'phone' && user.phone !== currentUser.phone)
    ) {
      setSubmitting(false);
      setSnackBarVisible(true);
      if ((type === 'email' && !currentUser.email) || (type === 'phone' && !currentUser.phone)) {
        setSnackBarMessage(
          `You haven't associated any ${type} in your account, please use ${
            type === 'phone' ? 'email' : 'phone'
          } instead`
        );
      } else {
        setSnackBarMessage(`Please enter valid ${type}`);
      }

      return;
    }

    await dispatch(deleteUserThunk({ userId: currentUser.userId as string, type, token: token as string }));
    if (type == 'email') {
      setUser({
        email: values.email,
        phone: values.phone,
        type,
        countryCode: values.countryCode,
      });
    } else if (type == 'phone') {
      if (values.countryCode == '') {
        setSubmitting(false);
        setSnackBarVisible(true);
        setSnackBarMessage('Country Code is required');
        return;
      } else {
        setUser({
          email: values.email,
          phone: values.phone,
          countryCode: values.countryCode,
          type,
        });
      }
    }
    if (deleteOtpSent) {
      setSubmitting(true);
    } else {
      setSubmitting(false);
    }
  };

  const setCountry = (number: any) => {
    const num = number.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    return num ? `+${num}` : '';
  };
  const setPhoneNumber = (number: any) => number.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

  return (
    <Fragment>
      <SnackBar
        type={SnackBarType.ERROR}
        visible={snackBarVisible}
        setVisible={setSnackBarVisible}
        content={snackBarMessage}
      />
      <StyledContent>This will permanently delete your account </StyledContent>
      <StyledContent>
        Your wallet will be removed from the blockchain and all assets owned by it will become preminantly inaccessible.
      </StyledContent>{' '}
      <StyledContent>
        Your data stored in NEARApps (Files, Contacts, NFT) will become perminently locked and unaccessible in their
        encrypted state, until removed.
      </StyledContent>{' '}
      <StyledContent>Please enter the primary contact method associated with your account to delete.</StyledContent>
      <DivButtonContainer>
        <ButtonOptions
          className={type === SIGNUP_FORM_TYPE.PHONE ? activeClassName : undefined}
          type="submit"
          name={SIGNUP_FORM_TYPE.PHONE}
          onClick={handleButtonClick}
          data-testid="phone-button"
        >
          Phone
        </ButtonOptions>
        <ButtonOptions
          className={type === SIGNUP_FORM_TYPE.EMAIL ? activeClassName : undefined}
          type="submit"
          name={SIGNUP_FORM_TYPE.EMAIL}
          onClick={handleButtonClick}
          data-testid="email-button"
        >
          Email
        </ButtonOptions>
      </DivButtonContainer>
      <div>
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
                      onChange={(e: any) => {
                        setUser({ ...user, email: e.target.value });
                        setFieldValue('email', e.target.value);
                      }}
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
                        onChange={(e: any) => {
                          setFieldValue('phone', setPhoneNumber(e.target.value));
                          setUser({ ...user, phone: setPhoneNumber(e.target.value) });
                        }}
                        error={errors.phone && touched.phone}
                        placeholder={'Ex. 3373788383'}
                      />
                    </DivPhoneInput>
                  </DivPhoneInputContainer>
                )}
                <ButtonSubmit disabled={!(dirty && isValid)}>Delete Account</ButtonSubmit>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Fragment>
  );
});
export default DeleteAccount;
