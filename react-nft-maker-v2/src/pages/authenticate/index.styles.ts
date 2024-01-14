import styled from '@emotion/styled';
import { Box } from '@mui/material';

import { COLORS } from '@/constants/colors';

export const DivDoubleArrowWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const DivTitle = styled.div`
  position: absolute;
  top: 12px;
`;

export const DivCrossIconWrapper = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
`;

export const DivAuthenticationContainer = styled.div`
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const DivAuthenticationTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const DivAuthenticationBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

export const DivHeading = styled.div`
  font-family: sans-serif;
  font-size: 21px;
  font-weight: 600;
  line-height: 26px;
  text-align: center;
`;

export const AuthenticationStyled = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .heading {
    font-family: sans-serif;
    font-size: 21px;
    font-style: normal;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: 0;
    text-align: center;
    color: ${COLORS.BLACK_100};
  }

  .icon {
    cursor: pointer;
  }
`;

export const DivAuthenticatedMobileView = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-radius: 20px;
  position: absolute;
  top: 44px;
  background-color: ${COLORS.WHITE_100};
  width: 100%;
`;

export const DivMobileTitleWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 14px 14px 0px 0px;
  .heading {
    font-family: sans-serif;
    font-size: 21px;
    font-style: normal;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: 0px;
    text-align: center;
  }
`;

export const DivMobileViewProgressBar = styled.div<{ width?: string }>`
  width: ${({ width }) => width || `120px;`};
  height: 5px;
  background-color: ${COLORS.THEME_BUTTON};
  align-self: flex-start;
`;

export const DivMobileViewBodyWrapper = styled.div`
  margin-top: 50px;
  padding: 12px;
`;

export const DivMobileCrossIcon = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
`;

export const DivFormWrapper = styled.div`
  .btn-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 40px;
    margin-top: 15px;
  }
  .btn-signup {
    width: 100px;
    text-align: center;
    color: ${COLORS.GREY_TEXT};
    border-radius: 50px;
    margin: 5px;
    background-color: white;
    border: 0px;
    font-weight: 500;
    font-size: 16.8px;
    padding: 5px;
  }
  .btn-signup-active {
    width: 100px;
    text-align: center;
    color: ${COLORS.GREY_100};
    border-radius: 13px;
    margin: 5px;
    background-color: ${COLORS.GREY_2};
    border: 0px;
    padding: 5px;
    font-weight: 500;
    font-size: 16.8px;
  }
  .heading {
    font-family: sans-serif;
    font-size: 21px;
    font-style: normal;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: 0px;
    text-align: center;
  }
`;

export const DivSubHeading = styled.div`
  font-size: 16px;
  font-style: normal;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: center;
  color: ${COLORS.BLACK_100};
`;

export const DivSubHeading1 = styled.div`
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: 0em;
  text-align: center;
  color: ${COLORS.BLUE_ACCENT};
`;

export const DivBackgroundImage = styled.div``;
export const DivCloseIcon = styled.div``;
