import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivContianer = styled.div`
  display: flex;
  margin-top: 120px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const TextTitle = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 19.2px;
  line-height: 23px;

  color: ${COLORS.GREY_LABEL};
`;

export const DivNftCardStyled = styled.div`
  min-width: 444px;
  margin-top: 25px;

  background: ${COLORS.WHITE_100};
  box-sizing: border-box;
  box-shadow: 0px 4.8px 4.8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

export const DivImagePlaceHolder = styled.div`
  position: relative;
  width: 100%;
`;

export const DivLabel = styled.div`
  position: absolute;
  background: ${COLORS.WHITE_100};
  padding: 6px 10px;
  border-radius: 10px;
  top: 10px;
  left: 10px;
  font-weight: semibold;
`;

export const ImgNtf = styled.img`
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  width: 100%;
  object-fit: cover;
`;

export const DivCardContent = styled.div`
  display: flex;
  padding: 20px;
  flex-direction: column;
`;

export const CardTitle = styled(TextTitle)`
  color: ${COLORS.BLACK_100};
`;

export const CardSubtitle = styled(TextTitle)`
  font-size: 16.2px;
`;

export const DivCreatorContainer = styled.div`
  margin-top: 15px;

  display: flex;
`;

export const ImgCreator = styled.img`
  height: 48px;
  weight: 48px;
  margin-right: 10px;
`;

export const DivCreatorDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TextCreator = styled(TextTitle)`
  font-size: 14.4px;
`;

export const TextCreatorName = styled(TextTitle)`
  font-weight: 600;
  font-size: 16.8px;
  color: ${COLORS.BLACK_100};
`;

export const DivMintButtonContainer = styled.div`
  display: flex;
  margin-top: 65px;
`;
