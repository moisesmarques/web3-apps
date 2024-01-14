import styled from '@emotion/styled';
import { DialogTitle } from '@mui/material';

import { COLORS } from '@/constants/colors';

import { AlignTitleType } from './CommonDialog.types';

export const DivTitleStyle = styled.div<{ alignTitle?: AlignTitleType }>`
  padding: 8px 18px;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  text-align: ${({ alignTitle }) => alignTitle || 'center'};
  letter-spacing: -0.154px;
  color: #1d2c3c;
  //position: relative;

  svg {
    position: absolute;
    top: 19px;
    right: 22px;
  }
`;

export const DivButtonWrapper = styled.div<{ position?: { top: string; right: string } }>`
  cursor: pointer;
  position: absolute;
  top: ${({ position }) => (position && position.top ? position.top : '-10px')};
  right: ${({ position }) => (position && position.right ? position.right : '0')};
  color: ${COLORS.BLUE_100};
`;

export const DivBackButtonWrapper = styled.div`
  cursor: pointer;
  position: absolute;
  top: 19px;
  left: 19px;
  color: ${COLORS.THEME_BUTTON};
  font-weight: 500;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.408px;
`;

export const DialogTitleStyled = styled(DialogTitle)`
  padding: 12px 24px;
`;
