import styled from '@emotion/styled';

import Button from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const DivContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-block-start: 1rem;
  padding-bottom: 200px;
`;

export const ParagraphPreviewTitle = styled.p`
  color: ${COLORS.GREY_LABEL};
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 19.2px;
  line-height: 23px;
`;

export const ButtonCreate = styled(Button)`
  width: 170px;
  margin-block-end: 0;
`;

export const DivButton = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  max-width: 500px;
  width: calc(100% - 64px);
  bottom: 32px;
  height: 80px;
  background-color: ${COLORS.WHITE_100};
`;

export const DivPreviewContainer = styled.div<{ isMobile?: boolean }>`
  max-width: 415px;
  margin-block-start: 1rem;
  margin-block-end: 4rem;

  background: ${COLORS.WHITE_100};
  border: 1.2px solid ${COLORS.BORDER_COLOR};
  box-sizing: border-box;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;

  display: grid;

  width: ${({ isMobile }) => (isMobile ? 'calc(100% + 40px)' : '100%')};
`;

export const DivImagePreviewContainer = styled.div`
  overflow: hidden;
  position: relative;

  img {
    margin-block-end: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const DivCategoryTag = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 4px 8px;
  border-radius: 8px;
`;

export const ImagePreview = styled.img<{ src?: any }>`
  object-fit: cover;
`;

export const DivPreviewDetails = styled.div`
  flex: 1;
  padding: 0.5rem 1rem;
  overflow: hidden;
`;

export const DivTitle = styled.div`
  font-size: 19.2px;
  line-height: 36px;
  color: ${COLORS.BLACK_100};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
`;

export const DivDescription = styled.div`
  font-size: 16.8px;
  line-height: 36px;
  color: ${COLORS.GREY_HEAVY};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
`;

export const DivCreatorInfoContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-block-start: 1rem;
  align-items: center;
`;

export const DivCreatorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DivCreatorTitle = styled.div`
  font-size: 14.4px;
  line-height: 20px;
  color: ${COLORS.GREY_HEAVY};
`;

export const DivCreatorName = styled.div`
  font-weight: 600;
  font-size: 16.8px;
  line-height: 23px;
  color: ${COLORS.BLACK_100};
`;
