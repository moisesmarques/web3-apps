import styled from '@emotion/styled';

import Button from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const DivBannerWrapper = styled.div<{ isMobile?: boolean }>`
  position: relative;
  padding: ${({ isMobile }) => `${isMobile ? `20px 20px 0` : `34px`}`};
  text-align: center;
  background: ${COLORS.WHITE_100};
  border: 1px solid ${COLORS.BORDER_COLOR};
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.04);
  border-radius: 10px;
`;

export const DivTitleWrapper = styled.div<{ isMobile?: boolean }>`
  text-align: ${({ isMobile }) => `${isMobile ? `left` : `center`}`};
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 27px;
  line-height: 32px;
  color: ${COLORS.BLACK_100};
  margin-bottom: 50px;

  strong {
    font-weight: 800;
  }
  ${({ isMobile }) => `${isMobile ? `max-width: 203px` : ``}`};
`;

export const DivLeftImageWrapper = styled.div<{ isMobile?: boolean }>`
  position: absolute;
  top: 0px;
  ${({ isMobile }) => `${isMobile ? `right: 0px` : `left: 0px`}`};
`;

export const DivRightImageWrapper = styled.div`
  position: absolute;
  right: 0px;
  bottom: -5px;
`;

export const ButtonContainer = styled(Button)<{ isMobile?: boolean }>`
  ${({ isMobile }) => `${isMobile ? `margin:20px 20px 20px 0` : `margin:auto`}`};
`;
