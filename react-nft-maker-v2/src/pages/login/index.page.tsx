import router from 'next/router';

import { ArrowBoth } from '@/assets/svg/arrow-both';
import { CloseIcon } from '@/assets/svg/close-icon';
import AuthLayout from '@/components/Layout/AuthLayout';
import { useWindowSize } from '@/hooks/useWindowsSize';
import LoginForm from '@/modules/LoginForm';

import { LoginStyled, DivFormWrapperContainer, IconContainer, DivCloseIcon } from './index.styles';

/**
 *
 * @returns login page
 */
const Login = () => {
  const { width } = useWindowSize();

  const handleCrossIconClick = () => {
    router.push('/');
  };

  return (
    <AuthLayout>
      <LoginStyled data-testid="login-container">
        <DivFormWrapperContainer>
          <IconContainer>
            <ArrowBoth />
          </IconContainer>
          <h3 className="heading" data-testid="heading">
            Login with your NEARApps ID
          </h3>
          <LoginForm />
        </DivFormWrapperContainer>
      </LoginStyled>
      <DivCloseIcon
        onClick={handleCrossIconClick}
        isMobile={width ? width < 1024 : false}
        className="icon"
        data-testid="close-icon"
      >
        <CloseIcon />
      </DivCloseIcon>
    </AuthLayout>
  );
};

export default Login;
