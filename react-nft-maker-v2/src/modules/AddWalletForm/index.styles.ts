import styled from '@emotion/styled';
import { Form as FormikForm } from 'formik';

import { COLORS } from '@/constants/colors';

export const DivContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DivInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Form = styled(FormikForm)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.GREY_HEAVY};
`;

export const DivButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
