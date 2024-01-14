import Link from 'next/link';
import { useRouter } from 'next/router';

import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';

import { CloseIcon } from '@/assets/svg/close-icon';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import AuthLayout from '@/components/Layout/AuthLayout';
import { useAppSelector, useAppDispatch } from '@/hooks/useReduxTypedHooks';
import { useWindowSize } from '@/hooks/useWindowsSize';
import VerificationForm from '@/modules/VerificationForm';
import { getAuthDataSelector, verifyPasscodeThunk, resetUser } from '@/store/auth';
import { IVerificationRequest } from '@/store/auth/types';
import { isObjectEmpty } from '@/utils/helper';

import {
  DivAuthenticatedMobileView,
  DivCrossIconWrapper,
  DivFormWrapper,
  DivMobileCrossIcon,
  DivMobileTitleWrapper,
  DivMobileViewBodyWrapper,
  DivMobileViewProgressBar,
  DivSubHeading,
  DivSubHeading1,
  DivCloseIcon,
  AuthenticationStyled,
  DivTitle,
} from './index.styles';

/**
 *
 * @returns Verification page
 */
const Authentication = () => {
  const [snackBarvisible, setSnackBarvisible] = useState<boolean>(false);
  const [snackBarmessage, setSnackBarmessage] = useState<string>('');

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, otpVerified, error } = useAppSelector(getAuthDataSelector);
  const [loading, setLoading] = useState(false);
  const handleClearStore = async () => {
    await dispatch(resetUser());
    router.push('/login');
  };

  const { width } = useWindowSize();

  useEffect(() => {
    if (error && error.length > 0) {
      setSnackBarvisible(true);
      setSnackBarmessage(error);
      setLoading(false);
    }

    if (isObjectEmpty(user)) router.push('/login');
    if (otpVerified) router.push('/all-nfts');
  }, [error, otpVerified]);

  const onSubmit = async (data: IVerificationRequest) => {
    setLoading(true);
    await dispatch(verifyPasscodeThunk(data));
  };

  const renderOtpFields = () => (
    <DivFormWrapper>
      <DivSubHeading>
        We've sent a 6-digit verification code to <br /> the {user.type === 'email' ? 'email' : 'phone'}
      </DivSubHeading>
      <DivSubHeading1>{user.type === 'email' ? user.email : user.phone}</DivSubHeading1>
      <VerificationForm loading={loading} setLoading={setLoading} data-testid="verification-form" onSubmit={onSubmit} />
    </DivFormWrapper>
  );

  return (
    <AuthLayout>
      {width && width > 1024 && (
        <AuthenticationStyled data-testid="authentication-container">
          <DivTitle>
            <h2 className="heading" data-testid="verification-heading">
              Verification
            </h2>
          </DivTitle>
          <Grid container display="flex" alignItems="center" justifyContent="center">
            {renderOtpFields()}
          </Grid>
          <DivCrossIconWrapper>
            <Link href="/login">
              <DivCloseIcon onClick={handleClearStore} className="icon" data-testid="close-icon">
                <CloseIcon />
              </DivCloseIcon>
            </Link>
          </DivCrossIconWrapper>
        </AuthenticationStyled>
      )}

      {width && width < 1024 && (
        <DivAuthenticatedMobileView>
          <DivMobileTitleWrapper>
            <h2 className="heading" data-testid="verification-heading">
              Authentication
            </h2>
            <DivMobileCrossIcon>
              <Link href="/login">
                <DivCloseIcon onClick={handleClearStore} className="icon" data-testid="close-icon">
                  <CloseIcon />
                </DivCloseIcon>
              </Link>
            </DivMobileCrossIcon>
          </DivMobileTitleWrapper>
          <DivMobileViewProgressBar />
          <DivMobileViewBodyWrapper>{renderOtpFields()}</DivMobileViewBodyWrapper>
        </DivAuthenticatedMobileView>
      )}
      <SnackBar
        type={SnackBarType.ERROR}
        visible={snackBarvisible}
        setVisible={setSnackBarvisible}
        content={snackBarmessage}
      />
    </AuthLayout>
  );
};

export default Authentication;
