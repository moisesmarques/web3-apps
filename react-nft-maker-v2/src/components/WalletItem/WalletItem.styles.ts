import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivWrapper = styled.div`
  border: 1px solid ${COLORS.BORDER_COLOR};
  border-radius: 8px;
  padding: 1rem;
  background: ${COLORS.WHITE_100};
  position: relative;
  display: flex;
`;

export const DivSelection = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  font-famile: Inter;
`;

export const DivContent = styled.div`
  padding-left: 1rem;
`;

export const SpanConnected = styled.span`
  font-size: 12px;
  margin-right: 5px;
  font-weight: 500;
`;

export const SectionContent = styled.section`
  margin-bottom: 1rem;
`;

export const SpanTitle = styled.section`
  font-weight: 600;
  font-size: 18px;
`;
export const SpanLabel = styled.section`
  font-size: 12px;
  color: ${COLORS.GREY_LABEL};
`;

export const SpanValue = styled.section`
  font-weight: 500;
  font-size: 16px;
`;

export const SpanCursorPointer = styled.span`
  cursor: pointer;
  display: flex;
`;

export const DivDeleteWallet = styled.button`
  cursor: pointer;
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 500;
  color: ${COLORS.THEME_BUTTON};
  padding: 0;
`;
