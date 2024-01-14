import styled from '@emotion/styled';
import { Field } from 'formik';

import { COLORS } from '@/constants/colors';

export const DivPhoneInput = styled.div`
  display: flex;
  gap: 10px;
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 19px;
  line-height: 19px;

  input {
    border: 1px solid ${COLORS.BUTTON_BORDER};
    background: ${COLORS.OFF_WHITE};
    height: 58px;
    font-size: 19px;
    padding-left: 17px;
    border-radius: 6px;
  }
  input:focus-visible {
    outline-color: #0672de;
  }
`;

export const InputPhoneNumber = styled(Field)`
  width: 100%;
`;

export const InputCountryCode = styled(Field)`
  height: 58px;
  max-width: 72px;
`;
