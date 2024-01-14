import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '@/constants/fonts';

const NftCardStyled = styled.div`
  background: ${COLORS.WHITE_100};
  box-sizing: border-box;
  box-shadow: 0px 4.8px 4.8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 276.19px;
  height: 261.8px;
  cursor: pointer;

  .card-image-container {
    height: 65%;
    position: relative;
  }

  .card-image {
    width: 100%;
    height: 100%;
    display: block;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    object-fit: cover;
  }

  .card-category-label {
    position: absolute;
    background: ${COLORS.WHITE_100};
    padding: 6px 10px;
    border-radius: 10px;
    top: 10px;
    left: 10px;
    font-weight: ${FONT_WEIGHTS.SEMIBOLD};
  }

  .card-content-area {
    padding: 10px;
  }

  .card-content-actions {
    display: flex;
    justify-content: space-between;

    .container-radio {
      position: relative;
      padding-left: 35px;
      margin-bottom: 12px;
      cursor: pointer;
      font-size: 22px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .container-radio input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark-radio {
      position: absolute;
      top: 0;
      left: 0;
      height: 25px;
      width: 25px;
      border-radius: 20px;
      background-color: #eee;
    }

    .container-radio:hover input ~ .checkmark-radio {
      background-color: #ccc;
    }

    .container-radio input:checked ~ .checkmark-radio {
      background-color: #2f80ed;
      border-radius: 20px;
    }

    .checkmark-radio:after {
      content: '';
      position: absolute;
      display: none;
    }

    .container-radio input:checked ~ .checkmark-radio:after {
      display: block;
    }

    .container-radio .checkmark-radio:after {
      left: 9px;
      top: 5px;
      width: 7px;
      height: 12px;
      border: solid white;
      border-width: 0 3px 3px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
    }
  }

  .card-title-text {
    font-size: ${FONT_SIZES.SUB_HEADING_2};
    font-weight: ${FONT_WEIGHTS.SEMIBOLD};
    margin: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .card-id-text {
    font-size: ${FONT_SIZES.SUB_HEADING_2};
    font-weight: ${FONT_WEIGHTS.REGULAR};
    color: ${COLORS.GREY_LABEL};
    margin: 5px;
  }
`;

export default NftCardStyled;
