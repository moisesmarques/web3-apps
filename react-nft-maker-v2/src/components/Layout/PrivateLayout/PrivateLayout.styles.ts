import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

const PrivateLayoutStyled = styled.div`
  background-color: ${COLORS.WHITE_08};
  header {
    height: 70px;
    padding-top: 10px;
    background-color: ${COLORS.WHITE_08} !important;
    position: absolute;
    top: 0;
    width: 100%;
    align-items: center;

    p,
    svg {
      margin: 0 20px;
    }
  }

  main {
    background-color: ${COLORS.WHITE_08};
    top: 70px;
    height: calc(100% - 70px);
    position: absolute;
    width: 100%;
    overflow: auto;
  }
`;

export default PrivateLayoutStyled;
