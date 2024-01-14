import styled from '@emotion/styled';

import CoreButton from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

export const StyledContent = styled.div`
  gap: 16px;
  color: ${COLORS.GREY_LABEL};
  font-size: 16px;
  text-align: center;
  margin-bottom: 0.5rem;
`;

export const ButtonOptions = styled(CoreButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  min-width: 66px;
  color: ${COLORS.GREY_TEXT};
  margin: 5px;
  background-color: ${COLORS.WHITE_100};
  border: none;
  font-weight: 500;
  font-size: 16.8px;
  padding: 5px;
  height: 30px;

  &:hover {
    color: ${COLORS.WHITE_100};
  }

  &.btn-signup-active {
    background-color: ${COLORS.GREY_2};

    &:hover {
      color: ${COLORS.BLACK_100};
    }
  }
`;

export const ButtonSubmit = styled(CoreButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  width: 100%;
  color: ${COLORS.WHITE_100};
  margin: 5px;
  background-color: ${COLORS.RED};
  border: none;
  font-weight: 500;
  font-size: 16.8px;
  padding: 0.5 rem;
  margin: 0 auto;
  margin-top: 1rem;

  &:hover {
    background-color: ${COLORS.RED};
  }
`;

export const DivButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 20px 0;
`;
