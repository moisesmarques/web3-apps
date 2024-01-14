import styled from '@emotion/styled';
import { InputAdornment } from '@mui/material';

import Label from '@/components/core/Label';
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
    background-color: ${COLORS.THEME_BUTTON};
  }
  .btn-signup {
    background-color: transparent;
    color: ${COLORS.THEME_BUTTON};

    &:hover {
      background-color: transparent;
    }
  }
`;

export const StyledText = styled.p`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: 0;
  text-align: center;
  margin-bottom: 6px;
  a {
    color: ${COLORS.BLUE_TEXT};
    text-decoration: none;
  }
`;

export const StyledAlertText = styled.p`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: 0;
  text-align: center;
  margin-bottom: 6px;
  margin-top: 25px;
  a {
    color: ${COLORS.BLUE_TEXT};
    text-decoration: none;
  }
`;

export const StyledInputAdornment = styled(InputAdornment)`
  p {
    color: ${COLORS.BLACK_100};
  }
`;

export const StyledLabel = styled(Label)`
  color: ${COLORS.GREY_HEAVY};
  font-size: 14px;
  margin-left: 5px;
  margin-bottom: 4px;
`;

export const DivSignUpLabel = styled.div`
  color: ${COLORS.BLUE_150};
  text-align: center;
  align-self: center;
  cursor: pointer;
`;
