import styled from '@emotion/styled';

import Button from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const DivSendNftSubTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 16.8px;
  line-height: 36px;
  color: ${COLORS.GREY_LABEL};
  text-align: center;
`;

export const DivHorizontalScroll = styled.div`
  display: flex;
  height: auto;
  overflow-x: auto;
  gap: 20px;
  padding-top: 20px;
  padding-bottom: 40px;
`;

export const ButtonSend = styled(Button)`
  cursor: pointer;
  margin-top: 20px;

  height: 54px;
  color: ${COLORS.WHITE_100};
  align-self: center;
  padding: 0 20px;
  background: #2f80ed;
  border-radius: 10px;
  border: none;

  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;

  svg {
    margin-left: 10px;
  }
`;

export const DivButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
