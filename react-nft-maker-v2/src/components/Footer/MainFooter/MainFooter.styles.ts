import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

const HEADER_HEIGHT = '70px';

export const MainFooter = styled.footer`
  height: ${HEADER_HEIGHT};
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  color: ${COLORS.BLACK_100};
  border-top: 1px solid ${COLORS.BORDER_COLOR};
  background-color: ${COLORS.WHITE_100} !important;
  position: fixed;
  bottom: 0;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.04);
  border-radius: 16px 16px 0px 0px;
  @media (max-width: 419px) {
    border-radius: 0;
  }
  ul {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0px;
    li {
      width: 163px;
      display: inline-block;
      text-align: center;
      color: #fff;
      cursor: pointer;

      @media (max-width: 419px) {
        width: 110px;
      }
    }
  }
`;
export const StyledLi = styled.li`
  width: 130px !important;
`;
