import styled from '@emotion/styled';

import Button from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const DivContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ImgPreview = styled.img`
  width: 96px;
`;

export const NftTitle = styled.span`
  font-weight: 500;
  font-size: 24px;
  line-height: 29px;
  text-align: center;
  letter-spacing: 0.456px;
  color: ${COLORS.BLACK_100};
  margin-block-start: 10px;
`;

export const NftTitleMessage = styled(NftTitle)`
  margin-block-start: 0;
`;

export const NftID = styled.span`
  font-size: 16.8px;
  line-height: 22px;
  text-align: center;
  letter-spacing: -0.1848px;
  color: #6d7885;
  margin-block-start: 10px;
`;

export const ButtonOpen = styled(Button)`
  width: 100%;
  margin: unset;
  margin-block-start: 40px;
`;
