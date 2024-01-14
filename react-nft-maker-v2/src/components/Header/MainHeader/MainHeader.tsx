import Link from 'next/link';
import router from 'next/router';

import React, { FC, memo } from 'react';

import { PrimeLabLogo } from '@/assets/svg/primelab-logo';
import { SettingIcon } from '@/assets/svg/setting-icon';
import { UserIcon } from '@/assets/svg/user-icon';

import { MainHeader, DivSettingIconWrapper, DivUserContainer } from './MainHeader.styles';

/**
 * Main Header component
 * @interface HeaderTypes
 * @property {isLogo} - Enable NFT Maker Logo
 * @property {fontSize} - Header font size
 * @property {padding} - Header padding
 * @property {accountId} - User accountId
 * @property {IsShowNFTContent} - To show and hide NFT contents
 */

interface HeaderTypes {
  isLogo?: boolean;
  padding?: string;
  accountId?: string;
  IsShowNFTContent?: boolean;
}

const HeaderNFT: FC<HeaderTypes> = memo(({ isLogo, padding, accountId, IsShowNFTContent }) => {
  return (
    <MainHeader data-testid="mainHeader" style={{ padding }}>
      <div className="logo" onClick={() => router.push('/all-nfts')}>
        {isLogo && <PrimeLabLogo />}
      </div>
      {IsShowNFTContent && (
        <div className="nftLinks">
          <ul className="drop">
            <li>Select all NFTs</li>
            <li>Select NFT</li>
            <li>Move NFT up</li>
            <li>Move NFT down</li>
            <li>Move NFT down</li>
          </ul>
        </div>
      )}
      <Link href={'/settings'}>
        <DivUserContainer>
          <UserIcon />
          <p>{accountId}</p>
        </DivUserContainer>
      </Link>
      <DivSettingIconWrapper onClick={() => router.push('/settings')}>
        <SettingIcon />
      </DivSettingIconWrapper>
    </MainHeader>
  );
});

export default HeaderNFT;
