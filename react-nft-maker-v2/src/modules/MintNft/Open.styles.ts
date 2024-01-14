import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-left: 20px;
`;

export const DivNftImageContainer = styled.div`
  height: 351px;
  width: 310px;
`;

export const ImgNft = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

export const TextBase = styled.span`
  font-family: Inter;
  font-style: normal;Î
  font-weight: normal;
  font-size: 16.2px;
  line-height: 23px;

  color: ${COLORS.BLACK_100}; 
`;

export const DivContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  gap: 20px;

  width: 60%;
`;

export const DivTagsContainer = styled.div`
  display: flex;
  gap: 13px;
`;

export const Tag = styled.span`
  padding: 6px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  color: ${COLORS.THEME_BUTTON};
  background-color: ${COLORS.BLUE_ACCENT_LIGHT};
`;
export const DivCreatorContainer = styled.div`
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

export const TextCreator = styled(TextBase)`
  font-size: 14.4px;
  color: ${COLORS.GREY_LABEL};
`;

export const TextCreatorName = styled(TextBase)`
  font-weight: 600;
  font-size: 16.8px;
`;

export const DivInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  weight: 100%;

  .label {
    margin-bottom: 10px;
  }
`;

export const DivButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;
