import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivStylesFormStyles = styled.div<{ isMobile?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;

  .mb-3 {
    margin-bottom: 16px;
  }

  form {
    width: ${({ isMobile }) => (isMobile ? '100%' : 'unset')};
  }

  .label {
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 17px;
    letter-spacing: 0em;
    text-align: left;
    color: ${COLORS.GREY_LABEL};
    span {
      color: ${COLORS.RED_100};
    }
  }

  .input {
    padding-block-start: 10px;
    padding-block-end: 4px;
    margin-block-end: 1rem;
    width: 100%;
  }

  .text-red-500 {
    color: ${COLORS.RED_100};
  }

  .center-align {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
export const Div = styled.div`
  width: 100%;
`;
