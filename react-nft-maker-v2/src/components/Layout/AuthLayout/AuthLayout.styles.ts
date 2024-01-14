import styled from '@emotion/styled';
import { Box } from '@mui/material';

import { COLORS } from '@/constants/colors';

export const AuthLayoutContainer = styled(Box)`
  .container {
    height: 100vh;

    @media only screen and (max-width: 1023px) {
      .left-section {
        height: 50%;
      }
    }

    .left-section {
      background-color: ${COLORS.BLACK_100};
      position: relative;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .right-section {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
`;

export const DivAuthBgImagesContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  text-align: center;
  > svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;
