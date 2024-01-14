import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  @media (max-width: 500px) {
    font-size: 13px;
  }
`;

export const DivItemLeftSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  .item-arrow-icon {
    justify-content: flex-start;
    margin-right: 10px;
  }
  .item-inner-content {
    @media (max-width: 500px) {
      max-width: 210px;
    }
  }
`;

export const HighlightText = styled.span`
  color: ${COLORS.THEME_BUTTON};
  margin-left: 3px !important;
  margin-right: 3px !important;
`;
export const HighlightTextBold = styled.a`
  text-decoration: none;
  color: ${COLORS.THEME_BUTTON};
  margin-left: 3px !important;
  margin-right: 3px !important;
  font-weight: 600;
  cursor: pointer;
  @media (max-width: 500px) {
    display: block;
  }
`;

export const SimpleText = styled.span`
  color: ${COLORS.DARK_LIVER};
`;

export const DivItemRightSection = styled.div`
  color: ${COLORS.GREY_LABEL};
  white-space: nowrap;

  @media (max-width: 500px) {
    font-size: 12px;
  }
`;
