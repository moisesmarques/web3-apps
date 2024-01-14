import { useEffect, useState } from 'react';

import { ErrorMessage, Field, Formik, FormikHelpers } from 'formik';

import Button from '@/components/core/Button';
import CommonDialog from '@/components/core/CommonDialog';
import Input from '@/components/core/FieldInput';
import PhoneInput from '@/components/core/PhoneInput';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getContactsList } from '@/services/contact/contact.service';
import { getAuthDataSelector } from '@/store/auth';
import {
  getContactsSelector,
  toggleAddContactModal,
  createContactsThunk,
  setAllContacts,
  clearErrors,
  setSelectedContacts,
  resetCreatedContact,
} from '@/store/contacts';
import { createContactValidation } from '@/validations/createContact';

import { ButtonWrapper, InputLabel, DivInput, Form } from './index.styles';
import { CreateContactValues } from './index.type';

interface Props {
  localOpen?: boolean;
  localToggle?(): void;
}

/**
 *
 * @returns Modal Create contact
 */

const CreateContact = ({ localOpen, localToggle }: Props) => {
  const { addContact, createContactError, createdContactData, selectedContacts } = useAppSelector(getContactsSelector);
  const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');

  const { user } = useAppSelector(getAuthDataSelector);
  const initialState = {
    firstName: '',
    email: '',
    phone: '',
  };
  const dispatch = useAppDispatch();

  const toggleModal = () => {
    if (localToggle) {
      localToggle();
    } else {
      dispatch(toggleAddContactModal());
    }
  };

  useEffect(() => {
    const errorMsg = createContactError || '';
    if (createContactError && createContactError.length > 0) {
      setSnackBarVisible(true);
      setSnackBarMessage(errorMsg);
    }
  }, [createContactError]);

  useEffect(() => {
    if (createdContactData && createdContactData.contactId !== '') {
      dispatch(setSelectedContacts([...selectedContacts, createdContactData]));
    }
  }, [createdContactData]);

  const onCloseSnackBar = () => {
    setSnackBarMessage('');
    setSnackBarVisible(false);
    dispatch(clearErrors());
  };

  const onFormSubmit = async (
    values: CreateContactValues,
    { setSubmitting, resetForm }: FormikHelpers<CreateContactValues>
  ) => {
    setSubmitting(true);
    const data = {
      ...values,
      phone: [{ number: `+${values.phone}`, type: 'mobile' }],
      email: [{ address: values.email, type: 'personal' }],
    };
    if (!data?.lastName) delete data?.lastName;

    dispatch(resetCreatedContact());
    const addContactRes = await dispatch(createContactsThunk({ requestBody: data, userId: user?.userId || '' }));
    const response: any = await getContactsList(user.userId);
    dispatch(setAllContacts(response?.data || []));

    if (localToggle) localToggle();
    if (addContactRes.meta.requestStatus !== 'rejected') {
      resetForm();
    }
  };

  return (
    <CommonDialog
      paperStyle={{ maxWidth: '676px' }}
      open={localOpen || addContact}
      onClose={() => toggleModal()}
      title={'Add New Contact'}
    >
      <Formik initialValues={initialState} validationSchema={createContactValidation} onSubmit={onFormSubmit}>
        {({ touched, errors, handleBlur, setFieldValue, dirty, isValid }) => {
          return (
            <Form method="POST">
              <DivInput>
                <InputLabel>First Name</InputLabel>
                <Field
                  as={Input}
                  id="firstName"
                  name="firstName"
                  type="firstName"
                  placeholder="First Name"
                  error={touched.firstName && errors.firstName ? true : false}
                  helperText={<ErrorMessage name="first name" />}
                />
              </DivInput>
              <DivInput>
                <InputLabel>Last Name</InputLabel>
                <Field
                  as={Input}
                  id="lastName"
                  name="lastName"
                  type="lastName"
                  placeholder="Last Name"
                  error={touched.lastName && errors.lastName ? true : false}
                  helperText={<ErrorMessage name="last name" />}
                />
              </DivInput>
              <DivInput>
                <InputLabel>Email</InputLabel>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  error={touched.email && errors.email ? true : false}
                  helperText={<ErrorMessage name="email" />}
                />
              </DivInput>
              <DivInput>
                <InputLabel>Phone</InputLabel>
                <PhoneInput
                  inputStyle={{ width: '100%' }}
                  name="phone"
                  id="phone"
                  onBlur={(e: any) => handleBlur(e)}
                  onChange={(e: any) => setFieldValue('phone', e)}
                  error={errors.phone && touched.phone ? true : false}
                  data-testid="phone-input"
                />
              </DivInput>

              <ButtonWrapper>
                <Button
                  disabled={!(dirty && isValid)}
                  type="submit"
                  backgroundColor={COLORS.THEME_BUTTON}
                  hoverColor={COLORS.THEME_BUTTON}
                >
                  Submit
                </Button>
              </ButtonWrapper>
            </Form>
          );
        }}
      </Formik>
      <SnackBar
        type={SnackBarType.ERROR}
        visible={snackBarVisible}
        setVisible={onCloseSnackBar}
        content={snackBarMessage}
      />
    </CommonDialog>
  );
};

export default CreateContact;
