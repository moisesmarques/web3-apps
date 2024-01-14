import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivLoaderContainer = styled.div`
  height: 100vh;
  width: 100%;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;

  .loader {
    color: ${COLORS.BLACK_100};
  }
`;

export const LoadingMessage = styled.span`
  margin-top: 20px;
  font-size: 18px;
  font-weight: 600;
`;
