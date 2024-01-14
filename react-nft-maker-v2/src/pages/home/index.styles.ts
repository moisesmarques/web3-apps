import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const LeftSideContainer = styled.div`
  background-color: ${COLORS.BLACK_100};
  height: 100vh;
  min-height: 100%;
  overflow: hidden;
  padding: 0% 10%;

  @media (max-width: 1023px) {
    height: 100%;
    max-height: 40vh;
  }
`;
export const LeftTopSection = styled.div`
  top: -150px;
  position: relative;
  display: flex;
  justify-content: center;
  max-height: 400px;
  max-width: 100%;

  @media (max-width: 1023px) {
    top: -150px;
  }
`;
export const DivHomeLogo = styled.div``;
export const DivHomeLogoTwo = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -0%);
`;
export const DivContainerLeftSide = styled.div`
  height: 100vh;
  background-color: ${COLORS.BLACK_100};
  width: 100%;
  color: ${COLORS.WHITE_100};

  @media (max-width: 1023px) {
    height: 50vh;
    overflow: hidden;
  }

  @media (max-width: 424px) {
    top: 200px;
  }
`;

export const LeftBottomSection = styled.div`
  margin-top: 80px;

  @media (max-width: 1023px) {
    margin-top: 0;
  }

  h1 {
    color: ${COLORS.WHITE_100};
    font-family: Inter;
    font-style: normal;
    font-weight: normal;
    font-size: 22px;
    line-height: 38px;
    text-align: center;

    @media (max-width: 1023px) {
      position: absolute;
      top: 150px;
      padding: 0 30px;

      font-family: Inter;
      font-style: normal;
      font-weight: normal;
      font-size: 15px;
      line-height: 27px;
      text-align: center;
    }

    @media (max-width: 510px) {
      top: 140px;
    }

    @media (max-width: 424px) {
      top: 160px;
    }
  }
`;

export const Hamburger = styled.div`
  visibility: hidden;
  position: absolute;
  right: 30px;
  top: 40px;

  button {
    background: none;
    border: none;
  }

  @media (max-width: 1023px) {
    visibility: visible;
  }
`;

export const RightSideContainer = styled.div``;

export const RightTopSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;

  @media (max-width: 1023px) {
    display: none;
  }

  button {
    margin: 0 40px;

    @media screen and (min-width: 1024px) and (max-width: 1072px) {
      margin: 0 30px;
    }
  }
`;

export const Button1 = styled.button`
  background-color: #fff;
  border: none;
  cursor: pointer;

  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 38px;
`;

export const Button2 = styled.button`
  background-color: #fff;
  border: none;
  cursor: pointer;

  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 38px;
`;

export const RightSecondSection = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 94px;

  @media (max-width: 424px) {
    margin-top: 10px;
  }

  @media (max-width: 1024px) {
    margin-top: 30px;
  }

  h1 {
    font-family: Inter;
    font-style: normal;
    font-weight: 400;
    font-size: 32px;
    line-height: 32px;

    span {
      font-weight: 800;
    }
  }
`;

export const RightThirdSection = styled.div`
  position: relative;
  display: flex;
  margin: 70px 0 30px 0;
`;

export const DivCardBodyOne = styled.div`
  background: #ffffff;
  border: 1.2px solid #dedede;
  box-sizing: border-box;
  box-shadow: 0px 4.8px 4.8px rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  width: 276.19px;
  height: 263px;
  position: relative;
  left: 180px;
  p {
    margin: 0;
  }

  .title {
    font-size: 19px;
    lineheight: 36px;
    padding-left: 18px;
  }

  .artId {
    font-size: 16.8px;
    line-height: 36px;
    padding-left: 18px;
    color: ${COLORS.GREY_LABEL};
  }

  @media (max-width: 424px) {
    left: 40px;
    width: 200px;
    height: 200px;
  }

  @media screen and (min-width: 425px) and (max-width: 511px) {
    left: 20px;
  }

  @media screen and (min-width: 512px) and (max-width: 619px) {
    left: 60px;
  }

  @media screen and (min-width: 620px) and (max-width: 700px) {
    left: 120px;
  }

  @media screen and (min-width: 769px) and (max-width: 991px) {
    left: 200px;
  }

  @media screen and (min-width: 1024px) and (max-width: 1159px) {
    left: 60px;
  }

  @media screen and (min-width: 1160px) and (max-width: 1439px) {
    left: 100px;
  }
`;

export const DivCardBodyTwo = styled.div`
  background: #ffffff;
  border: 1.2px solid #dedede;
  box-sizing: border-box;
  box-shadow: 0px 4.8px 4.8px rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  width: 276.19px;
  height: 263px;
  position: absolute;
  left: 320px;
  bottom: 40px;
  p {
    margin: 0;
  }

  .title {
    font-size: 19px;
    lineheight: 36px;
    padding-left: 18px;
  }

  .artId {
    font-size: 16.8px;
    line-height: 36px;
    padding-left: 18px;
    color: ${COLORS.GREY_LABEL};
  }

  @media screen and (min-width: 250px) and (max-width: 365px) {
    left: 120px;
    width: 200px;
    height: 200px;
  }

  @media screen and (min-width: 366px) and (max-width: 424px) {
    left: 160px;
    width: 200px;
    height: 200px;
  }

  @media screen and (min-width: 425px) and (max-width: 511px) {
    left: 140px;
  }

  @media screen and (min-width: 512px) and (max-width: 619px) {
    left: 220px;
  }

  @media screen and (min-width: 620px) and (max-width: 700px) {
    left: 250px;
  }

  @media screen and (min-width: 769px) and (max-width: 991px) {
    left: 340px;
  }

  @media screen and (min-width: 992px) and (max-width: 1024px) {
    left: 340px;
  }

  @media screen and (min-width: 1024px) and (max-width: 1159px) {
    left: 200px;
  }

  @media screen and (min-width: 1160px) and (max-width: 1439px) {
    left: 250px;
  }
`;

export const DivCardBodyTwoTop = styled.div`
  height: 180px;
  overflow: hidden;
  position: relative;

  @media (max-width: 424px) {
    height: 100px;
  }

  p {
    background: #ffffff;
    border-radius: 7.2px;
    width: 104.47px;
    height: 30.02px;
    font-size: 16.8px;
    font-weight: 600;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 17px;
    top: 15px;
    padding: 0;
  }
  svg {
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 12px 12px 0 0;
  }
`;

export const GetStatedButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  button {
    font-family: Inter;
    font-style: normal;
    font-weight: 500;
    font-size: 17px;
    line-height: 22px;
    letter-spacing: -0.408px;

    &:hover {
      background: #2f80ed;
    }
  }
`;
export const LegalTermsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
  font-size: 14px;
`;

export const Privacy = styled.a`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  color: #2f80ed;
  margin-right: 20px;
  cursor: pointer;
`;

export const Terms = styled.a`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  color: #2f80ed;
  margin-left: 20px;
  cursor: pointer;
`;

export const DivCopyRight = styled.p`
  margin-top: 60px;
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 17px;
  text-align: center;
  color: ${COLORS.GREY_LIGHT_10};
`;

export const PopupContainer = styled.div`
  display: block;
  display: flex;
  flex-direction: column;
  text-align: center;

  .css-1irazvh {
    display: flex;
    justify-content: center;
  }
`;

export const CloseButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 0;

  button {
    background: none;
    border: none;
  }
`;
