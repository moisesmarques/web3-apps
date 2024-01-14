import { useRouter } from 'next/router';

import { useEffect } from 'react';

import { Grid } from '@mui/material';

import { PrimeLabAssets } from '@/assets/svg/prime-lab-assets';
import { PrimeLabLogo } from '@/assets/svg/primelab-logo';
import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getAuthDataSelector } from '@/store/auth';

import { DivAuthBgImagesContainer, AuthLayoutContainer } from './AuthLayout.styles';

/**
 * Authentication Layout
 * @interface IAuthLayout
 * @property {children} - Child components
 */

interface IAuthLayout {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: IAuthLayout) => {
  const router = useRouter();
  const { token } = useAppSelector(getAuthDataSelector);

  useEffect(() => {
    if (token) {
      router.push('/all-nfts');
    }
  }, [token]);
  return (
    <AuthLayoutContainer data-testid="auth-layout-container">
      <Grid container className="container">
        <Grid item md={6} sm={12} xs={12} className="left-section">
          <DivAuthBgImagesContainer>
            <PrimeLabAssets />
            <PrimeLabLogo />
          </DivAuthBgImagesContainer>
        </Grid>
        <Grid item md={6} sm={12} xs={12} className="right-section">
          {children}
        </Grid>
      </Grid>
    </AuthLayoutContainer>
  );
};

export default AuthLayout;
