import { ReactNode } from 'react';

import { HeaderLogo } from '@/assets/svg/header-logo';

import PublicLayoutStyled from './PublicLayout.styles';

const PublicLayout = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <PublicLayoutStyled>
      <header className="flex justify-between">
        <HeaderLogo />
        <p>
          Have an account? <span className="text-blue cursor-pointer">Login</span>
        </p>
      </header>
      <main>{children}</main>
    </PublicLayoutStyled>
  );
};

export default PublicLayout;
