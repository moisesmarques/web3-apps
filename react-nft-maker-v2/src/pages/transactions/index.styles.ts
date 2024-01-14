import styled from '@emotion/styled';
import Button from '@mui/material/Button';

import { COLORS } from '@/constants/colors';

export const DivTransaction = styled.div`
  justify-content: space-between;
  padding: 0 20px;
  display: flex;
  margin-top: 27px;

  @media (max-width: 500px) {
    flex-wrap: wrap;
  }
`;

export const DivTab = styled.div`
  background-color: transparent;
  color: #2f80ed;
  height: 38px;
  max-width: 422px;
  width: 100%;
  font-weight: 500;
  font-size: 16.8px;
  text-align: center;
  border-radius: 10px;
  display: flex;
  justify-content: center;

  button:nth-child(1) {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }

  button:nth-last-child(1) {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    border-right: 1px solid #2f80ed;
  }

  @media (max-width: 500px) {
    order: 3;
    margin-top: 10px;
  }
`;

export const TabButton = styled.button<{ active?: boolean }>`
  font-weight: 500;
  font-size: 16.8px;
  width: 100%;
  color: ${({ active }) => (active ? COLORS.WHITE_100 : COLORS.THEME_BUTTON)};
  background-color: ${({ active }) => (active ? COLORS.THEME_BUTTON : COLORS.WHITE_100)};
  border: 1px solid #2f80ed;
  border-right: none;
  cursor: pointer;
`;

export const SendButton = styled(Button)`
  text-transform: none;
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 16.8px;
  color: ${COLORS.THEME_BUTTON};

  @media (max-width: 500px) {
    order: 2;
  }
`;
export const DivPageHeader = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 21.6px;
  line-height: 36px;
  color: #000000;

  @media (max-width: 500px) {
    order: 1;
  }
`;
