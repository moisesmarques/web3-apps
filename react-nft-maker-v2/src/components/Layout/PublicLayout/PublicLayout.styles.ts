import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

const PublicLayoutStyled = styled.div`
  header {
    height: 70px;
    background-color: ${COLORS.GREY_90};
    position: absolute;
    top: 0;
    width: 100%;
    align-items: center;

    p,
    svg {
      margin: 0 20px;

      .text-blue {
        color: ${COLORS.BLUE_100};
      }
    }
  }

  main {
    top: 70px;
    height: calc(100% - 70px);
    position: absolute;
    width: 100%;
  }
`;

export default PublicLayoutStyled;
