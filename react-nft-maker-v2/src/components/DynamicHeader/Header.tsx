import { useRouter } from 'next/router';

import React, { FC, memo } from 'react';

import { BackIcon } from '@/assets/svg/back-icon';

import { BackIconStyled, MainHeader, Title } from './Header.styles';

/**
 * Main Header component
 * @interface HeaderTypes
 * @property {title} - Header title, required
 * @property {isBackButton} - Enable back button
 * @property {fontSize} - Header font size
 * @property {padding} - Header padding
 */

interface HeaderTypes {
  title: string;
  isBackButton?: boolean;
  isLogo?: boolean;
  fontSize?: string;
  padding?: string;
  isSearch?: boolean;
  left?: boolean; // includes left of 25px to handle /wallet route back button
}

const Header: FC<HeaderTypes> = memo(({ title, isBackButton, fontSize, padding, left }) => {
  const router = useRouter();
  const handleClick = () => {
    router.back();
  };

  return (
    <MainHeader data-testid="mainHeader" style={{ padding }}>
      {isBackButton && (
        <BackIconStyled data-testid="mainHeaderBack" onClick={handleClick} left={left}>
          <BackIcon />
        </BackIconStyled>
      )}
      <Title style={{ fontSize }}>{title}</Title>
    </MainHeader>
  );
});

export default Header;
