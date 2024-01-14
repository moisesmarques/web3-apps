import { useState } from 'react';

import AuthLayout from '@/components/Layout/AuthLayout';
import SignupForm from '@/modules/SignupForm';

import { DivFormWrapperContainer, DivButtonContainer, Button } from './index.styles';

/**
 *
 * @returns signup page
 */

enum SIGNUP_FORM_TYPE {
  PHONE = 'phone',
  EMAIL = 'email',
}
const Signup = () => {
  const [type, setType] = useState<string>(SIGNUP_FORM_TYPE.PHONE);

  const activeClassName = 'btn-signup-active';

  const handleButtonClick = (e: any) => {
    setType(e.target.name);
  };

  return (
    <AuthLayout>
      <DivFormWrapperContainer data-testid="signup-container">
        <DivButtonContainer>
          <Button
            className={type === SIGNUP_FORM_TYPE.PHONE ? activeClassName : undefined}
            type="submit"
            name={SIGNUP_FORM_TYPE.PHONE}
            onClick={handleButtonClick}
            data-testid="phone-button"
          >
            Phone
          </Button>
          <Button
            className={type === SIGNUP_FORM_TYPE.EMAIL ? activeClassName : undefined}
            type="submit"
            name={SIGNUP_FORM_TYPE.EMAIL}
            onClick={handleButtonClick}
            data-testid="email-button"
          >
            Email
          </Button>
        </DivButtonContainer>
        <SignupForm type={type} data-testid="signup-form" />
      </DivFormWrapperContainer>
    </AuthLayout>
  );
};

export default Signup;
