import Link from 'next/link';

import { Fragment } from 'react';

import { Divider } from '@mui/material';

import { ArrowRight } from '@/assets/svg/arrow-right';
import Button from '@/components/core/Button';

import { DivStyled, StyledText } from './CreateAccountFooter.styles';

const CreateAccountFooter = () => {
  return (
    <Fragment>
      <DivStyled>
        <StyledText>
          By creating a NEARApps ID account, you agree to the NEAR Wallet <br />{' '}
          <Link href="/"> Terms & Conditions</Link> and
          <Link href="/"> Privacy Policy.</Link>
        </StyledText>
      </DivStyled>
      <Divider />
      <DivStyled>
        <p className="heading-2">Already have NEARApps ID Account ?</p>
      </DivStyled>
      <DivStyled>
        <Link href="/login">
          <Button className="btn-login" data-testid="login-create-account">
            Login With NEARApps ID
            <ArrowRight />
          </Button>
        </Link>
      </DivStyled>
    </Fragment>
  );
};
export default CreateAccountFooter;
