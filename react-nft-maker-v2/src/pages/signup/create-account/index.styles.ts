import styled from '@emotion/styled';
import { Box } from '@mui/material';

import { COLORS } from '@/constants/colors';

export const DivCreateAccountContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  ${({ isMobile }) =>
    `${
      isMobile &&
      `
        border-radius: 20px;
        position: absolute;
        top: 44px;
        background-color: white;
        width: 100%;
  `
    }`};
`;

export const DivCreateAccountTop = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  align-self: center;
  justify-content: space-between;
  text-align: center;
`;

export const DivCreateAccountBottom = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
`;

export const DivCreateAccountTitle = styled.div`
  font-size: 21px;
  font-weight: 600;
  line-height: 26px;
  text-align: center;
`;
export const DivCreateAccountSubtitle = styled(DivCreateAccountTitle)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 19px;
  text-align: left;
  margin-bottom: 10px;
  color: ${COLORS.GREY_LABEL};
`;

export const CreateAccountStyled = styled(Box)`
  height: 100vh;
  .container {
    height: 100vh;

    .left-section {
      background-color: ${COLORS.BLACK_100};
      position: relative;
      overflow-x: hidden;

      .background-image {
        position: absolute;
        bottom: 0;
        left: -7px;
      }
    }
  }
`;

export const DivCrossIconWrapper = styled.div<{ isMobile: boolean }>`
  position: absolute;
  top: 4px;
  right: 16px;
  ${({ isMobile }) => `${isMobile && `top: 50px;`}`};
`;
