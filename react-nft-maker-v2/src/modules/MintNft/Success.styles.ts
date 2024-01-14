import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivContianer = styled.div`
  display: flex;
  flex-direction: column;
  jusify-content: center;
  align-items: center;
`;

export const TextBase = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 16.2px;
  line-height: 23px;

  color: ${COLORS.BLACK_100};
`;

export const TextTitle = styled(TextBase)`
  font-weight: bold;
  font-size: 18px;
`;

export const ImgNft = styled.img`
  width: 100%;
  border-radius: 12px;
  max-width: 310px;
`;

export const TextMintedTitle = styled(TextBase)`
  font-weight: 600;
  font-size: 14px;
  margin-top: 18px;
`;

export const TextMintedSubtitle = styled(TextBase)`
  color: ${COLORS.GREY_LABEL};
`;

export const DivButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
`;
