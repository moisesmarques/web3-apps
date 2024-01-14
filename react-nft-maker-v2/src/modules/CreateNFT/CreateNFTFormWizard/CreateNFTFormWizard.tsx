import React, { useCallback } from 'react';

import { ErrorMessage, Field, Form, Formik } from 'formik';

import { ArrowRight } from '@/assets/svg/arrow-right';
import Input from '@/components/core/FieldInput/FieldInput';
import Label from '@/components/core/Label';
import { COLORS } from '@/constants/colors';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAppDispatch } from '@/hooks/useReduxTypedHooks';
import { ButtonCreate } from '@/modules/CreateNFT/CreateNFT.styles';
// import AddNFTAttributes from '@/modules/CreateNFT/CreateNFTFormWizard/AddAttributes';
import { setCreateNFTFormData } from '@/store/nft/nftSlice';
import { createNFTValidation } from '@/validations';

import { DivStylesFormStyles, Div } from './CreateNFTFormWizard.styles';
import { FormValues } from './CreateNFTFormWizard.type';

type IProps = {
  setProgress?: (progress: number) => void;
  handleNext: () => void;
};

const CreateNFTFormWizard = (props: IProps) => {
  const { handleNext } = props;
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();
  const initialValues = {
    title: '',
    description: '',
  };

  const onFormSubmit = useCallback(
    (values: FormValues) => {
      dispatch(
        setCreateNFTFormData({
          title: values.title,
          description: values.description,
        })
      );
      handleNext();
    },
    [handleNext]
  );

  return (
    <DivStylesFormStyles data-testid="create-nft-form" isMobile={isMobile}>
      <Formik initialValues={initialValues} validationSchema={createNFTValidation} onSubmit={onFormSubmit}>
        {({ errors, touched, dirty, isValid }) => (
          <Div>
            <Form>
              <Label htmlFor="title" className="label">
                TITLE <span>*</span>
              </Label>
              <Field
                as={Input}
                id="title"
                name="title"
                placeholder="Ex. Redeemable Art"
                className="input"
                error={!!(touched.title && errors.title)}
                helperText={<ErrorMessage name="title" />}
              />
              <Label htmlFor="description" className="label">
                DESCRIPTION <span>*</span>
              </Label>
              <Field
                as={Input}
                id="description"
                name="description"
                className="input"
                placeholder="Ex. Redeemable Art"
                error={!!(touched.description && errors.description)}
                helperText={<ErrorMessage name="description" />}
              />
              {/* The property values are not saved into the backend, there is not specific validation for defining the properties,
              so we don't use at this moment, but we use in future <AddNFTAttributes /> */}
              <div className="center-align">
                <ButtonCreate
                  disabled={!(dirty && isValid)}
                  type="submit"
                  backgroundColor={COLORS.THEME_BUTTON}
                  hoverColor={COLORS.THEME_BUTTON}
                >
                  Next <ArrowRight />
                </ButtonCreate>
              </div>
            </Form>
          </Div>
        )}
      </Formik>
    </DivStylesFormStyles>
  );
};

export default CreateNFTFormWizard;
