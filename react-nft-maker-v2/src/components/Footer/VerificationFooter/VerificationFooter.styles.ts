import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const StyledDiv = styled.div`
  font-family: Inter;
  display: flex;
  align-items: center;
  justify-content: center;
  .btn-login {
    height: 45px;
    background-color: ${COLORS.THEME_BUTTON};
  }
  .heading-2 {
    font-size: 19px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0em;
    text-align: left;
    color: ${COLORS.BLACK_100};
  }
`;

export const StyledText = styled.p`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 17px;
  text-align: center;
  color: ${COLORS.BLACK_100};
  padding: 0px;
  margin-top: 20px;
  margin-bottom: 0px;
  cursor: pointer;
  .link {
    color: ${COLORS.THEME_BUTTON};
    font-family: Inter;
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 19px;
    text-align: center;
    text-decoration: none;
  }
`;

export const DivVerificationFooterWrapper = styled.div`
  border-top: 1.2px solid #e9e6e6;
`;
