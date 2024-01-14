import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivStylesFormStyles = styled.div`
  .mb-3 {
    margin-bottom: 16px;
  }

  .text-red-500 {
    color: ${COLORS.RED_100};
  }
`;

export const DivStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  .btn-login {
    height: 45px;
    background-color: ${COLORS.THEME_BUTTON};
  }
`;

export const StyledText = styled.p`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: 0em;
  text-align: center;
  a {
    color: #49aeff;
    text-decoration: none;
  }
`;
export const DivEmail = styled.div`
  height: auto;
  .MuiTextField-root > div {
    padding: 1px;
    height: 58px !important;
  }
`;

export const DivPhoneInputContainer = styled.div``;
