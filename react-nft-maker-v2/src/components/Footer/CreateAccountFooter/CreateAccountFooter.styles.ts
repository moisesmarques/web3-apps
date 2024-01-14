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
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 19px;
  letter-spacing: 0em;
  text-align: center;
  color: ${COLORS.GREY_LABEL};
  a {
    color: ${COLORS.BLUE_ACCENT};
    text-decoration: none;
  }
`;
