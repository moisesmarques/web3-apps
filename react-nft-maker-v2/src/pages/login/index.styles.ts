import styled from '@emotion/styled';
import { Box } from '@mui/material';

import { COLORS } from '@/constants/colors';

export const LoginStyled = styled(Box)`
  display: flex;
  position: relative;
  padding: 40px 20px;
  .container {
    height: 100vh;

    .left-section {
      background-color: ${COLORS.BLACK_100};
      position: relative;
      overflow-x: hidden;
    }

    .right-section {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  }
`;

export const DivBgImagesContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: -7px;
`;

export const DivFormWrapperContainer = styled.div`
  width: 100%;
  align-self: center;

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
    font-size: 21px;
    font-style: normal;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: 0px;
    text-align: center;
  }
  .sub-heading {
    font-size: 17px;
    font-style: normal;
    font-weight: 400;
    line-height: 23px;
    letter-spacing: 0em;
    text-align: left;
    color: ${COLORS.GREY_LABEL};
    padding-top: 10%;
    padding-bottom: 10%;
  }
`;

export const DivButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 40px;
  margin-top: 15px;
`;

export const IconContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export const DivCloseIcon = styled.div<{ isMobile?: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  ${({ isMobile }) => `${isMobile && `top: calc(50vh + 20px);;`}`};
`;
