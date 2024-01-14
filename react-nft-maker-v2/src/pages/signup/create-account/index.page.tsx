import { useRouter } from 'next/router';

import { useEffect } from 'react';

import { CloseIcon } from '@/assets/svg/close-icon';
import AuthLayout from '@/components/Layout/AuthLayout';
import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import { useWindowSize } from '@/hooks/useWindowsSize';
import CreateAccountForm from '@/modules/CreateAccountForm';
import { DivMobileViewProgressBar } from '@/pages/authenticate/index.styles';
import { getAuthDataSelector } from '@/store/auth';

import {
  DivCreateAccountTop,
  DivCreateAccountBottom,
  DivCreateAccountTitle,
  DivCreateAccountContainer,
  DivCrossIconWrapper,
} from './index.styles';
/**
 *
 * @returns Create Account page
 */
const CreateAccount = () => {
  const { user } = useAppSelector(getAuthDataSelector);
  const router = useRouter();

  const { width } = useWindowSize();

  useEffect(() => {
    if (user.type === '') router.push('/signup');
  }, [user]);

  const handleCrossIconClick = () => {
    router.push('/signup');
  };

  return (
    <AuthLayout>
      <DivCreateAccountContainer isMobile={width ? width < 1024 : false}>
        <DivCreateAccountTop>
          <DivCreateAccountTitle data-testid="create-account-heading">Create NEARApps ID Account</DivCreateAccountTitle>
        </DivCreateAccountTop>
        {width && width < 1024 && <DivMobileViewProgressBar width={'60%'} />}
        <DivCreateAccountBottom>
          <CreateAccountForm data-testid="create-account-form" />
        </DivCreateAccountBottom>
      </DivCreateAccountContainer>
      <DivCrossIconWrapper onClick={handleCrossIconClick} isMobile={width ? width < 1024 : false}>
        <CloseIcon />
      </DivCrossIconWrapper>
    </AuthLayout>
  );
};

export default CreateAccount;
