import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

const HEADER_HEIGHT = '6rem';

export const MainHeader = styled.header`
  height: ${HEADER_HEIGHT};
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: 100%;
  color: ${COLORS.BLACK_100};
  flex-wrap: nowrap;
  gap: 20px;
`;

export const BackIconStyled = styled.button<{ left?: boolean }>`
  position: absolute;
  left: ${({ left }) => (left ? '25px' : '0px')};
  cursor: pointer;
  background-color: transparent;
  border: none;
`;

export const Title = styled.span`
  font-weight: 600;
  font-style: normal;
  font-size: 21px;
  text-align: center;
  padding: 1rem;
`;

export const DivSearchControlContainer = styled.div`
  padding-right: 3%;
  padding-bottom: 19px;
`;
