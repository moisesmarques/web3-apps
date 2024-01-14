import styled from '@emotion/styled';
import { TextField } from '@mui/material';
import { Form as FormikForm } from 'formik';

import { COLORS } from '@/constants/colors';

export const Form = styled(FormikForm)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DivAddContact = styled.div`
  text-align: center;
  max-width: 498px;
  width: 100%;
  margin: auto;
  margin-top: 35px;
`;

export const DivInput = styled.div`
  margin: auto;
  width: 100%;
  text-align: left;
  margin-bottom: 20px;
`;

export const CustomInput = styled(TextField)`
  width: 100%;
  height: 60px;
  border: none !important;

  input {
    height: 18px;
  }

  &.MuiTextField-root > div {
    height: 50px;
    border-radius: 6px;
    background-color: ${COLORS.GREY_4};
    font-size: 19px;
    font-style: normal;
    font-weight: 400;
    line-height: 23px;
    letter-spacing: 0;
    text-align: left;
    border: none !important;
  }

  &.error {
    border-color: ${COLORS.RED_100};
  }

  & .MuiOutlinedInput-root {
    &.Mui-focused fieldset {
      border-color: ${COLORS.THEME_BUTTON};
    }
  }
`;

export const InputLabel = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  margin-left: 3px;
  margin-bottom: 6px;
`;

export const DivButtonTitleContent = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  text-align: initial;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const DivTitle = styled.div`
  display: flex;
`;
