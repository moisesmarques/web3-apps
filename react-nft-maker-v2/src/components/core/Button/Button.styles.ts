import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const ButtonStyled = styled.button<{ backgroundColor?: string; hoverColor?: string }>`
  min-width: 100px;
  height: 50px;
  background-color: ${({ backgroundColor }) => `${backgroundColor || COLORS.LABEL_COLOR}`};
  color: ${COLORS.WHITE_100};
  border-radius: 10px;
  font-size: 17px;
  font-style: normal;
  font-weight: 500;
  line-height: 26px;
  letter-spacing: -0.4896000027656555px;
  border: 0px;
  padding-left: 25px;
  padding-right: 25px;
  margin: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  &:disabled {
    background-color: ${COLORS.GREY_90};
    cursor: not-allowed;
  }
  &:hover {
    background-color: ${({ hoverColor }) => `${hoverColor || COLORS.LABEL_COLOR}`};
  }
`;
