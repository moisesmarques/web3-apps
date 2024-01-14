import styled from '@emotion/styled';

import Button from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const DivSingleNftWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  gap: 20px;

  @media screen and (max-width: 680px) {
    display: block;
  }
`;

export const DivSingleNftImage = styled.img`
  border-radius: 8px;
  height: 351px;
  width: 250px;
  flex: 1;

  @media screen and (max-width: 680px) {
    width: 100%;
  }
`;

export const DivSingleNftDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 21px;
  flex: 1;
`;

export const DivSingleNftDetailsTop = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  flex-wrap: wrap;
`;

export const DivSingleNftTag = styled.div`
  border-radius: 8px;
  padding: 6px 18px;
  background-color: #d7e8ff;
  color: ${COLORS.THEME_BUTTON};
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
`;

export const DivAvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
`;

export const DivAvatarImage = styled.div<{ background?: string }>`
  height: 34px;
  width: 34px;
  background-image: ${({ background }) => `url(${background})`};
  background-color: ${COLORS.BORDER_COLOR};
  background-repeat: no-repeat;
  border-radius: 50%;
`;

export const DivAvatarDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DivAvatarTitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #6f6e73;
`;

export const DivAvatarName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${COLORS.BLACK_100};
`;

export const DivDropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const DivDropdownTitle = styled(DivAvatarTitle)`
  font-weight: 500;
  color: #818181;
`;

export const DivButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`;

export const ButtonStyled = styled(Button)`
  padding: 0 10px;
  margin: 0;

  span {
    margin-right: 8px;
  }
`;
