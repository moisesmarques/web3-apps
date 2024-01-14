import styled from '@emotion/styled';
import { Divider } from '@mui/material';

import { COLORS } from '@/constants/colors';

export const DivContainer = styled.div`
  height: 100vh;
  width: 100%;
  padding-right: 5%;
  padding-left: 5%;
  padding-top: 10px;
  background-color: ${COLORS.OFF_WHITE};
  @media (min-width: 500px) {
    padding-right: 30%;
    padding-left: 30%;
  }
`;
export const DivRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
export const DivFlexRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  & .walletId-conatiner {
    display: flex;
    flex-direction: row;
  }
`;
export const DivConnectedWallet = styled.div`
  margin-top: 5px;
  margin-bottom: 5px;
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  color: #808080;
`;
export const DivAllWallet = styled.div`
  cursor: pointer;
  margin-top: 5px;
  margin-bottom: 5px;
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  color: #2f80ed;
`;
export const DivBox = styled.div`
  background: #ffffff;
  border: 1px solid #dedede;
  box-sizing: border-box;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  width: 100%;
  padding: 20px;
  margin-top: 15px;
  margin-bottom: 15px;
  cursor: pointer;
`;
export const DivContentBold = styled.div`
  margin-left: 10px;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
`;
export const SpanInfoIcon = styled.span`
  position: absolute;
  cursor: pointer;
  margin-left: 0.5rem;
  align-self: center;
`;
export const SpanIconInside = styled.span`
  display: flex;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
`;
export const DividerStyled = styled(Divider)`
  margin-top: 10px;
  margin-bottom: 20px;
`;
export const DivContent = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: -0.3px;
`;
export const Div = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;
export const DivLabel = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: -0.3px;
  color: #808080;
`;
export const DivColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const DivModalContainer = styled.div``;

export const DivTitleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  margin-bottom: 1.5rem;
  span {
    text-align: center;
    font-family: Inter;
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
    line-height: 29px;
    color: ${COLORS.BLACK_100};
    width: 90%;
  }
`;

export const DivCancelIcon = styled.div`
  position: absolute;
  right: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export const DivSecondContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  justify-content: space-between;
  align-items: center;
  span {
    font-family: Inter;
    font-style: normal;
    font-weight: 600;
    font-size: 19.2px;
    letter-spacing: -0.36px;
    color: ${COLORS.BLACK_100};
  }
  input,
  .MuiFormControl-root {
    width: 100% !important;
  }
`;

export const DivCheckBoxIconContainer = styled.div`
  background: ${COLORS.THEME_BUTTON};
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  cursor: pointer;
`;

export const DivRoundIconContainer = styled.div`
  background: ${COLORS.WHITE_100};
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  border: 2px solid;
`;

export const DivAddButton = styled.div`
  .btn-add {
    background-color: ${COLORS.THEME_BUTTON};
    width: 100%;
    margin: 20px 0 0;
    color: ${COLORS.WHITE_100};
    display: flex;
    justify-content: center;
    border-radius: 12px;
  }
`;
export const DivFormAddWalletContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  height: 92%;
  background: #fff;
  padding: 20px;
  box-shadow: 24;
  border-radius: 5px;
`;

export const DivDoubleArrowWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const DivAuthHeading = styled.p`
  text-align: center;
  font-size: 24px;
  font-weight: 600;
`;

export const DivFormWrapper = styled.div`
  font-size: 19.2px;
  font-weight: 400;
  text-align: center;
  .sub-heading {
    color: ${COLORS.BLUE_ACCENT};
  }
`;
