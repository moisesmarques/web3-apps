import React from 'react';

import { ErrorMessage, Field, Formik, FormikHelpers } from 'formik';

import Button from '@/components/core/Button';
import CommonDialog from '@/components/core/CommonDialog';
import Input from '@/components/core/FieldInput';
import PhoneInput from '@/components/core/PhoneInput';
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { ICreateWalletServiceRequestProps } from '@/store/wallet/types';
import { createWalletThunk } from '@/store/wallet/walletSlice';
import { addWalletValidation } from '@/validations';

import { DivInputWrapper, Form, InputLabel, DivButtonWrapper } from './index.styles';
import { FormValues } from './index.type';

type Props = {
  openModal: boolean;
  setOpenModal: (state: boolean) => void;
  onSubmit: (wallet: ICreateWalletServiceRequestProps) => void;
};

const AddWalletForm = ({ openModal, setOpenModal, onSubmit }: Props) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const onFormSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    setSubmitting(true);
    await dispatch(
      createWalletThunk({
        walletName: values?.walletName,
        email: values?.email,
        phone: `+${values?.phone}`,
        userId: user?.userId,
      })
    );
    onSubmit(values);
  };

  return (
    <CommonDialog maxWidth="xs" title="Add New Wallet" open={openModal} onClose={() => setOpenModal(false)}>
      <Formik
        initialValues={{
          walletName: '',
          userId: '',
          email: '',
          phone: '',
        }}
        validationSchema={addWalletValidation}
        onSubmit={onFormSubmit}
      >
        {({ touched, errors, handleBlur, setFieldValue, dirty, isValid }) => {
          return (
            <Form method="POST">
              <DivInputWrapper>
                <InputLabel>Wallet Name</InputLabel>
                <Field
                  as={Input}
                  id="walletName"
                  name="walletName"
                  type="walletName"
                  placeholder="Wallet Name"
                  error={touched.walletName && errors.walletName ? true : false}
                  helperText={<ErrorMessage name="wallet name" />}
                />
              </DivInputWrapper>
              <DivInputWrapper>
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
              </DivInputWrapper>
              <DivInputWrapper>
                <InputLabel>Phone</InputLabel>
                <PhoneInput
                  name="phone"
                  id="phone"
                  onBlur={(e: any) => handleBlur(e)}
                  onChange={(e: any) => setFieldValue('phone', e)}
                  error={errors.phone && touched.phone ? true : false}
                  data-testid="phone-input"
                />
              </DivInputWrapper>

              <DivButtonWrapper>
                <Button
                  disabled={!(dirty && isValid)}
                  type="submit"
                  className="add-wallet-submit"
                  backgroundColor={COLORS.THEME_BUTTON}
                  hoverColor={COLORS.THEME_BUTTON}
                >
                  Submit
                </Button>
              </DivButtonWrapper>
            </Form>
          );
        }}
      </Formik>
    </CommonDialog>
  );
};

export default AddWalletForm;
