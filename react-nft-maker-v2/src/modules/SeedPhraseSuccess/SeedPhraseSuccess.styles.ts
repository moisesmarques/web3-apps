import styled from '@emotion/styled';

import Button from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const DivContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.span`
  font-weight: 500;
  font-size: 24px;
  line-height: 29px;
  text-align: center;
  letter-spacing: 0.456px;
  color: ${COLORS.BLACK_100};
  margin-block-start: 10px;
`;

export const SeedPhraseText = styled.span`
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 29px;
  text-align: center;
  letter-spacing: 0.456px;
  color: #000000;
  margin: 9.6px 0px;
`;

export const ButtonClose = styled(Button)`
  width: 100%;
  margin: unset;
  margin-block-start: 40px;
`;
