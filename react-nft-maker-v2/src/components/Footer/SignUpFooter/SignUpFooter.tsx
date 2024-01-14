import Link from 'next/link';

import { Fragment } from 'react';

import { Divider } from '@mui/material';

import {
  AlertText,
  DivLoginWithNear,
  DivSignupWrapper,
  DivStyled,
  DivTermAndConditionText,
  StyledText,
} from './SignUpFooter.styles';

interface ISignupFooter {
  customTermsAndConditionText?: React.ReactNode | string;
}

const SignUpFooter = ({ customTermsAndConditionText }: ISignupFooter) => {
  return (
    <DivSignupWrapper>
      {!customTermsAndConditionText ? (
        <Fragment>
          <AlertText>
            If you don't want to make this Account ID public, please change your Account ID to something that can be
            public.
          </AlertText>
          <DivTermAndConditionText>
            By clicking continue you must agree to NEAR Labs <br />
            <Link href="https://terms.nftmakerapp.io/"> Terms & Conditions</Link> and
            <Link href="https://privacy.nftmakerapp.io/"> Privacy Policy.</Link>
          </DivTermAndConditionText>
        </Fragment>
      ) : (
        <DivTermAndConditionText>{customTermsAndConditionText}</DivTermAndConditionText>
      )}

      <Divider />
      <DivStyled>
        <StyledText data-testid="footer-text-login">Already have NEARApps ID Account?</StyledText>
      </DivStyled>
      <Link href="/login">
        <DivLoginWithNear>Login with NEARApps ID</DivLoginWithNear>
      </Link>
    </DivSignupWrapper>
  );
};
export default SignUpFooter;
