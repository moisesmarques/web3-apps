import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivTransactionListStyled = styled.div`
  padding: 20px 0;
  margin-bottom: 50px;

  &.transactions {
    padding: 20px;
  }
`;
export const DivItemTitleSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SeeAllText = styled.span`
  color: ${COLORS.THEME_BUTTON};
  cursor: pointer;
`;
