import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivContentContainer = styled.div<{ selectedFile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-block-start: ${({ selectedFile }) => (selectedFile ? '1rem' : '0')};
`;

export const DivImagePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-block: 1rem;
  max-height: 152px;
`;

export const ImagePreview = styled.img<{ src?: any }>`
  object-fit: contain;
  max-height: 122px;
  margin-block-end: 0.5rem;
`;

export const DivMediaPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  margin-block: 1rem;
`;

export const DivVideoPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-block: 1rem;
`;

export const VideoPreview = styled.video<{ src?: any }>`
  object-fit: contain;
  height: 200px;
  margin-block-end: 0.5rem;
`;

export const DivAudioPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-block: 1rem;
  max-height: 122px;
`;

export const AudioPreview = styled.audio`
  object-fit: contain;
  height: 200px;
  margin-block-end: 0.5rem;
`;

export const DivImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;

  background: ${COLORS.WHITE_100};
  border: 1.2px dashed #808080;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 3.5rem;
  align-items: center;
`;

export const ParagraphExtensionDescription = styled.p`
  margin-block-start: 1.5rem;
  margin-block-end: 0;

  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 15.6px;
  line-height: 19px;

  color: #808080;
`;

export const InputFileUpload = styled.input`
  display: none;
`;

export const LabelFileUpload = styled.label`
  cursor: pointer;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 19.2px;
  line-height: 23px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #323232;
`;

export const DivFileUploadWrapper = styled.div`
  width: 167.95px;
  height: 54.04px;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.11)),
    linear-gradient(0deg, ${COLORS.WHITE_100}, ${COLORS.WHITE_100}),
    linear-gradient(0deg, ${COLORS.WHITE_100}, ${COLORS.WHITE_100}), ${COLORS.WHITE_100};
  border: 1.2px solid #c4c4c4;
  box-sizing: border-box;
  border-radius: 9.6px;
  display: grid;
  place-items: center;
`;

export const TitleImageContainer = styled.span`
  font-family: Inter;
  font-size: 16.8px;
  font-style: normal;
  font-weight: bold;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
  margin-bottom: 1rem;

  color: #000000;
`;
