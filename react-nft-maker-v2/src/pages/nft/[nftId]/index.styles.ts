import styled from '@emotion/styled';
import { Box } from '@mui/material';

import Button from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const NftDetailsLayoutContainer = styled(Box)`
  .container {
    height: 100vh;

    @media only screen and (max-width: 1023px) {
      .left-section {
        height: 50%;
      }
    }

    .left-section {
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

export const DivDetailsContainer = styled.div<{ isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${({ isMobile }) => (isMobile ? `20px` : `38px`)};
  width: 100%;
  ${({ isMobile }) =>
    isMobile &&
    `
  background: ${COLORS.WHITE_100};
  position: absolute;
  top: 35%;
  border-radius: 20px 20px 0px 0px;
  `};
`;

export const DivCloseButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const DivInfo = styled.div``;

export const DivNftInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const NftCategory = styled.span`
  background-color: black;
  padding: 0 12px;
  border-radius: 8px;
  width: fit-content;
  font-weight: 600;
  font-size: 16.8px;
  line-height: 36px;
  color: ${COLORS.WHITE_100};
`;

export const NftTitle = styled.span`
  width: fit-content;
  font-weight: 600;
  font-size: 25.2px;
  line-height: 31px;
  text-align: center;
  color: ${COLORS.BLACK_100};
`;

export const NftNumber = styled.span`
  width: fit-content;
  font-weight: 500;
  font-size: 19.2px;
  line-height: 26px;
  letter-spacing: -0.4896px;
  color: ${COLORS.THEME_BUTTON};
`;

export const DivNftCreator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  gap: 12px;
`;

export const DivNftCreatorContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
`;

export const DivNftCreatorDetails = styled.div`
  display: flex;
  gap: 4px;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const CreatorTitle = styled.span`
  font-size: 14.4px;
  line-height: 20px;
  color: #808080;
`;

export const CreatorName = styled.span`
  font-weight: 600;
  font-size: 16.8px;
  line-height: 23px;
  color: #000000;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ButtonSend = styled(Button)`
  width: 130px;
  margin: unset;

  svg {
    margin-inline-start: 1rem;
    height: 14px;
  }
`;

export const DivAccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const DivAttributeContainer = styled.div`
  display: flex;
  gap: 20px;
  border-bottom: solid 1px ${COLORS.GREY_3};
  padding-bottom: 1rem;
`;

export const AttributeName = styled.span`
  font-weight: 400;
  color: ${COLORS.GREY_LABEL};
  flex: 1;
  text-align: left;
  font-size: 16.8px;
`;

export const AttributeValue = styled.span`
  font-weight: 400;
  color: ${COLORS.BLUE_ACCENT};
  flex: 1;
  text-align: right;
  font-size: 16.8px;
`;

export const Paragraph = styled.p`
  font-size: 16.8px;
  color: ${COLORS.GREY_LABEL};
`;
