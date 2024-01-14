import styled from '@emotion/styled';
import { TextField } from '@mui/material';

import { COLORS } from '@/constants/colors';

export const DivSelectContact = styled.div`
  text-align: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const SearchBar = styled(TextField)`
  width: 100%;
  height: 50px;
  border: none !important;

  &.MuiTextField-root > div {
    height: 50px;
    border-radius: 6px;
    background-color: ${COLORS.GREY_4};
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 23px;
    letter-spacing: 0;
    text-align: left;
    border: none !important;
  }
  &.error {
    border-color: ${COLORS.RED_100};
  }

  & .MuiOutlinedInput-root {
    &.Mui-focused fieldset {
      border-color: ${COLORS.THEME_BUTTON};
    }
  }
  svg {
    cursor: pointer;
  }
`;
export const DivImportButtonContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
`;

export const DivButtonTitleContent = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  text-align: initial;
`;

export const BlueTitle = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  text-align: center;
  letter-spacing: -0.154px;
  color: #2f80ed;
  margin: auto 20px;
  cursor: pointer;
  padding: 0 8px;
  @media (max-width: 576px) {
    margin: auto 5px;
  }
`;

// export const DivButtonWrapper = styled.div`
//   position: absolute;
//   bottom: 50px;
//   display: flex;
//   height: 105px;
//   width: 90%;
//   background-color: ${COLORS.WHITE_100};
// `;
export const DivButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 90%;
  display: flex;
  height: 105px;
  background-color: ${COLORS.WHITE_100};
`;

export const ButtonSend = styled.button`
  cursor: pointer;
  margin: auto;

  height: 54px;
  color: ${COLORS.WHITE_100};
  align-items: center;
  padding: 0 20px;
  background: #2f80ed;
  border-radius: 10px;
  border: none;

  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;

  svg {
    margin-left: 10px;
  }
  &:disabled {
    background-color: ${COLORS.GREY_90};
    cursor: not-allowed;
  }
`;

export const DivTitle = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 26px;
  padding-right: 6px;
`;

export const DivContactsList = styled.div`
  margin-top: 20px;
  margin-bottom: 40px;
  padding: 0 32px 20px 2px;
  @media (max-width: 576px) {
    padding: 0 15px 20px 2px;
    margin-bottom: 60px;
  }
  div::-webkit-scrollbar {
    display: none;
  }
`;

export const DivContactWrapper = styled.div`
  width: 100%;
  margin: 20px 0;
`;

export const DivContact = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const DivContactInfo = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 576px) {
    flex: 0 0 85%;
    max-width: 85%;
  }
  .sb-avatar__text > div {
    font-size: 25px !important;
    font-weight: 500;
  }
`;

export const DivContactDetails = styled.div`
  margin-left: 1rem;
  word-break: break-all;
`;

export const DivContactTitle = styled.h3`
  margin-bottom: 5px;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  max-width: 256px;
  letter-spacing: -0.154px;
  color: ${COLORS.MIRAGE};
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DivContactSubTitle = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 14.4px;
  line-height: 22px;
  letter-spacing: -0.154px;
  color: rgba(0, 0, 0, 0.5);
`;

export const DivSelectedIcon = styled.div`
  margin: auto 0;
`;

export const Divider = styled.div`
  margin-top: 20px;
  margin-bottom: 10px;

  width: 100%;
  height: 0;
  left: 453px;
  top: 663px;

  border: 1px solid rgba(0, 0, 0, 0.06);
`;

export const ManualButtonWrapper = styled.div`
  height: 105px;
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 90%;
  background-color: ${COLORS.WHITE_100};
`;

export const ButtonSkip = styled.button`
  border: none;
  background: transparent;
  height: 46px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 20.4px;
  text-align: center;
  letter-spacing: -0.4896px;
  color: ${COLORS.GREY_6};
  cursor: pointer;
`;
