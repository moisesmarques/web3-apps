import styled from '@emotion/styled';
import { Button } from '@mui/material';

import { COLORS } from '@/constants/colors';

export const DivPageWrapper = styled.div`
  padding: 0 20px;
`;

export const DivNfts = styled.div`
  justify-content: space-between;
  display: flex;
  margin-top: 27px;
`;

export const DivPageHeader = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 21.6px;
  line-height: 36px;
  color: #000000;
`;

export const SendButton = styled(Button)`
  text-transform: none;
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 16.8px;
  color: ${COLORS.THEME_BUTTON};
`;
