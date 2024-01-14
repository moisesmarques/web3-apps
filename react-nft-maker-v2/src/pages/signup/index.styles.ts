import styled from '@emotion/styled';
import { Box } from '@mui/material';

import CoreButton from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const SignupStyled = styled(Box)`
  height: 100vh;
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
  padding-right: 20%;
  padding-left: 20%;
  align-self: center;

  @media screen and (max-width: 576px) {
    padding-right: 1rem;
    padding-left: 1rem;
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
  margin: 20px 0;
`;

export const Button = styled(CoreButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  min-width: 66px;
  color: ${COLORS.GREY_TEXT};
  margin: 5px;
  background-color: ${COLORS.WHITE_100};
  border: none;
  font-weight: 500;
  font-size: 16.8px;
  padding: 5px;
  height: 30px;

  &:hover {
    color: ${COLORS.WHITE_100};
  }

  &.btn-signup-active {
    background-color: ${COLORS.GREY_2};

    &:hover {
      color: ${COLORS.BLACK_100};
    }
  }
`;
