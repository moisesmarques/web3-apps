import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivStylesFormStyles = styled.div`
  max-width: 340px;
  .mb-3 {
    margin-bottom: 16px;
  }
  .label {
    font-family: Inter;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 15px;
    color: ${COLORS.GREY_LABEL};
    margin-bottom: 8px;
    margin-top: 20px;
  }
  .text-red-500 {
    color: ${COLORS.RED_100};
  }
`;
