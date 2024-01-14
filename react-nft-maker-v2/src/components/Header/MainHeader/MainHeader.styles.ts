import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

const HEADER_HEIGHT = '70px';

export const MainHeader = styled.header`
  height: ${HEADER_HEIGHT};
  padding: 0 20px;
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: ${COLORS.WHITE_100};
  background-color: ${COLORS.WHITE_100} !important;
  ul {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0px;
    flex-wrap: wrap;
    justify-content: center;
    li {
      //width: 163px;
      display: inline-block;
      text-align: center;
      color: ${COLORS.WHITE_100};
      margin-left: 20px;
    }
  }

  .nftLinks {
    display: none;
  }

  .logo {
    cursor: pointer;
    svg {
      margin: 0;
    }
  }

  @media all and (max-width: 768px) {
    justify-content: center;
    position: relative;
    padding: 0 20px;
    .logo {
      display: none;
    }
  }

  @media all and (min-width: 1252px) {
    .nftLinks {
      display: block;
    }
  }
`;

export const DivUserContainer = styled.div`
  background: ${COLORS.WHITE_100};
  border: 1px solid ${COLORS.BORDER_COLOR};
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.04);
  border-radius: 50px;
  display: flex;
  background-color: white;
  color: black;
  border-radius: 19px;
  height: 40px;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  svg {
    margin: 0 !important;
  }
  p {
    margin: 0 !important;
    padding: 0 10px;
  }
`;

export const DivSettingIconWrapper = styled.div`
  cursor: pointer;
  svg {
    margin-left: 70px !important;
  }
  @media all and (max-width: 768px) {
    position: absolute;
    right: 20px;
    display: flex;
    align-items: center;
  }
`;
