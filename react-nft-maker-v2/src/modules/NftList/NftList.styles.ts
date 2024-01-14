import styled from '@emotion/styled';

import { COLORS } from '@/constants/colors';

export const DivNftListStyled = styled.div`
  box-sizing: border-bot;

  h3 {
    margin: 20px 0px 0px 0px;
  }

  .MuiContainer-root {
    padding: 0px;
  }

  .MuiGrid-item {
    padding: 0px;
  }

  .filters-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .no-records-container {
    padding: 1rem;
    background: ${COLORS.GREY_LIGHT};
  }

  .nft-grid {
    .MuiGrid-item {
      flex-basis: 0%;
    }

    overflow-x: auto;
  }

  .MuiSelect-select {
    margin-right: -70px;
  }

  @media (max-width: 630px) {
    .css-11lq3yg-MuiGrid-root {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;

export const DivCardWrapper = styled.div`
  padding: 0px 20px 20px 0;
`;

export const DivMyNftTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0px;

  span {
    font-family: Inter;
    font-style: normal;
    font-weight: 500;
    line-height: 36px;
    color: ${COLORS.THEME_BUTTON};
  }
`;

export const DivFilterSortWrapper = styled.div`
  display: flex;
  margin-top: 20px;
  margin-bottom: 8px;

  .wrapper {
  }
`;

export const DivFiltersButtonWrapper = styled.div`
  cursor: pointer;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 20px;
  border: 1px solid ${COLORS.BUTTON_BORDER};
  box-sizing: border-box;
  border-radius: 6px;
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 10px;
  color: ${COLORS.BLACK_100};

  span {
    margin-right: 8px;
  }
`;
export const DivLabel = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 21.6px;
  line-height: 36px;
  color: ${COLORS.BLACK_100};
`;

export const DivSortButtonWrapper = styled.div``;
export const DivNoNFTs = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 235px;
  left: 56px;
  top: 472px;
  background: #d9d9d9;
`;

export const SeeAllText = styled.span`
  color: ${COLORS.THEME_BUTTON};
  cursor: pointer;
`;
