import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const ImagePreview = styled.img`
  filter: drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.04));
  box-sizing: border-box;
  border-radius: 20px;
  width: calc(100% - 100px);
  min-width: 300px;
  max-width: 470px;
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

export const VideoPreview = styled.video<{ src?: any }>`
  box-sizing: border-box;
  border-radius: 20px;
  width: calc(100% - 100px);
  min-width: 300px;
  max-width: 470px;
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

export const AudioPreview = styled.audio`
  box-sizing: border-box;
  border-radius: 20px;
  width: calc(100% - 100px);
  min-width: 300px;
  max-width: 470px;
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

export const DivPreviewImageContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  text-align: center;
  background-color: ${COLORS.NFT_DETAILS_PREVIEW_BG_COLOR};

  > svg {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
  }
`;
