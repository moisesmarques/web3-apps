import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivContainer = styled.div`
  height: 100vh;
  width: 100%;
  padding-right: 5%;
  padding-left: 5%;
  padding-top: 61px;
  background-color: ${COLORS.GREY_2};
  @media (min-width: 500px) {
    padding-right: 30%;
    padding-left: 30%;
  }
`;

export const DivFlexRow = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
`;

export const DivPostFixIcon = styled.div`
  position: absolute;
  right: 0;
`;

export const DivBox = styled.div`
  background: #ffffff;
  border: 1px solid #dedede;
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  width: 100%;
  max-width: 823px;
  padding: 20px;
  margin: 15px auto;
  cursor: pointer;
`;
export const DivContentBold = styled.div`
  margin-left: 10px;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;

  //text overflow
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 70%;
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

export const DivTopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

export const DivTopTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${COLORS.GREY_LABEL};
`;

export const AddWalletButton = styled.button`
  background-color: transparent;
  outline: none;
  color: ${COLORS.THEME_BUTTON};
  font-size: 18px;
  font-weight: 500;
  border: solid 1px transparent;
  cursor: pointer;
`;

export const DivVerificationContainer = styled.div`
  width: 676px;
  background-color: ${COLORS.WHITE_100};
  border-radius: 8px;
`;

export const DivModalContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const DivFormWrapper = styled.div`
  font-size: 19.2px;
  font-weight: 400;
  text-align: center;
  .sub-heading {
    color: ${COLORS.BLUE_ACCENT};
  }
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
