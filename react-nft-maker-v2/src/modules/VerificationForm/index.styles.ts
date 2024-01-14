import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const StylesFormStyles = styled.div`
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }

  .mb-3 {
    margin-bottom: 16px;
  }

  .text-red-500 {
    color: ${COLORS.RED_100};
  }

  .align-container {
    display: flex;
    align-items: center;
    justify-content: center;
    .input-field {
      margin: 5px;
      margin-bottom: 4px;
      background-color: white;

      .MuiInputBase-formControl {
        background: ${COLORS.WHITE_08};
        width: 46px;
        height: 46px;
        border-radius: 6px;
        font-size: 18px;
        font-weight: bold !important;
      }

      input:focus {
        background-color: white;
      }
    }
  }

  .label {
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 19px;
    color: ${COLORS.LABEL_COLOR};
  }
`;

export const DivLoaderContainer = styled.div`
  height: 100vh;
  width: 100%;
  z-index: 100;
  background-color: ${COLORS.WHITE_80};
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;

  .loader {
    color: ${COLORS.BLACK_100};
  }
`;
