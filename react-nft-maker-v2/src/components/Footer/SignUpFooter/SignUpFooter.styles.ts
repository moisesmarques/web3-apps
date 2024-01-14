import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  .btn-login {
    height: 45px;
    background-color: ${COLORS.THEME_BUTTON};
  }
  margin: 20px 0 !important;
`;

export const StyledText = styled.p`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: 0em;
  text-align: center;
  a {
    color: ${COLORS.BLUE_TEXT};
    text-decoration: none;
  }
`;

export const DivLoginWithNear = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 21px;
  text-align: center;
  color: ${COLORS.THEME_BUTTON};
  cursor: pointer;
`;

export const DivSignupWrapper = styled.div`
  box-sizing: border-box;
  padding-bottom: 50px;

  * {
    margin: 0;
    padding: 0;
  }
`;

export const DivTermAndConditionText = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  margin-bottom: 20px;
  color: ${COLORS.TERM_AND_CONDITION_COLOR};

  a {
    color: ${COLORS.THEME_BUTTON};
    text-decoration: none;
  }
`;

export const AlertText = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  margin-bottom: 20px;
  margin-top: 20px;
  color: ${COLORS.TERM_AND_CONDITION_COLOR};

  a {
    color: ${COLORS.THEME_BUTTON};
    text-decoration: none;
  }
`;
