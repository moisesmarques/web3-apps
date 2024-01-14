import { useRouter } from 'next/router';

import React, { FC, memo, useState, useCallback } from 'react';

import { AddIcon } from '@/assets/svg/add-icon';
import { DoubleArrowIcon } from '@/assets/svg/double-arrow-icon';
import { HomeIcon } from '@/assets/svg/home-icon';
import FooterMenu from '@/components/Footer/FooterMenu';
import { useAppDispatch } from '@/hooks/useReduxTypedHooks';
import MintNft from '@/modules/MintNft';
import { setActiveFooterTab } from '@/store/common';

import { MainFooter, StyledLi } from './MainFooter.styles';

/**
 * Main Footer component
 * @interface FooterTypes
 * @property {padding} - Footer padding
 */

interface FooterTypes {
  padding?: string;
}

enum ActiveTab {
  DASHBOARD = 'dashboard',
  TRASACTIONS = 'transactions',
}

const FooterNFT: FC<FooterTypes> = memo(({ padding }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [plusButtonActive, setPlusButtonActive] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleTogglePlusButton = useCallback(() => setPlusButtonActive(!plusButtonActive), [plusButtonActive]);

  const handleClick = async (tab: ActiveTab) => {
    dispatch(setActiveFooterTab(tab));
    if (tab === ActiveTab.DASHBOARD) {
      router.push('/all-nfts');
    } else if (tab === ActiveTab.TRASACTIONS) {
      router.push('/transactions');
    }
  };

  const handleModalClose = () => {
    setIsOpen(false);
  };

  return (
    <MainFooter data-testid="mainFooter" style={{ padding }}>
      <MintNft open={isOpen} onClose={handleModalClose} />
      <ul>
        <StyledLi onClick={() => handleClick(ActiveTab.DASHBOARD)}>
          <HomeIcon isActive={router.pathname === '/all-nfts'} />
        </StyledLi>
        <StyledLi>
          <FooterMenu toggleActive={handleTogglePlusButton}>
            <AddIcon isActive={plusButtonActive} />
          </FooterMenu>
        </StyledLi>
        <StyledLi onClick={() => handleClick(ActiveTab.TRASACTIONS)}>
          <DoubleArrowIcon isActive={router.pathname === '/transactions'} />
        </StyledLi>
      </ul>
    </MainFooter>
  );
});

export default FooterNFT;
