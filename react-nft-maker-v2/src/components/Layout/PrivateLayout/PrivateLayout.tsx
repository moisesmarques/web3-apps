import { useRouter } from 'next/router';

import { ReactNode, useEffect, useState } from 'react';

import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import MainFooter from '@/components/Footer/MainFooter';
import MainHeader from '@/components/Header/MainHeader';
import { useNftListData } from '@/hooks/apis/nft/useNftListData';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import SelectContact from '@/modules/SelectContact';
import { getAuthDataSelector } from '@/store/auth';
import { clearErrors, getContactsSelector } from '@/store/contacts';
import { getDialogsStatus } from '@/store/dialogs/dialogsSelector';
import { getNftSelector, getNtfCreateStatus } from '@/store/nft';
import { clearNftErrors } from '@/store/nft/nftSlice';

import PrivateLayoutStyled from './PrivateLayout.styles';

const PrivateLayout = ({
  children,
  isFooterNeeded,
  justSignedUp,
}: {
  children: ReactNode;
  isDesktopHeader?: boolean;
  isMobileHeader?: boolean;
  isFooterNeeded?: boolean;
  justSignedUp?: boolean;
}): JSX.Element => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(getAuthDataSelector);
  const { allNfts = [] } = useAppSelector(getNftSelector);
  const { currentStep } = useAppSelector(getNtfCreateStatus);
  const { selectContactDialog, allContacts, allContactsLoading } = useAppSelector(getContactsSelector);
  const { isLoading } = useNftListData();
  const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const { isSelectContactOpen } = useAppSelector(getDialogsStatus);
  const [newSignup, setNewSignup] = useState<boolean>(justSignedUp || false);

  useEffect(() => {
    if (!token) {
      router.push('/');
    }

    if (justSignedUp === false) {
      setNewSignup(false);
    }
  }, [token, justSignedUp]);

  const onCloseSnackBar = () => {
    setSnackBarMessage('');
    setSnackBarVisible(false);
    dispatch(clearErrors());
    dispatch(clearNftErrors());
  };

  return (
    <PrivateLayoutStyled>
      {!newSignup &&
        ((!allNfts.length &&
          !currentStep &&
          !allContactsLoading &&
          allContacts.length > 0 &&
          !isLoading &&
          selectContactDialog) ||
          isSelectContactOpen) && <SelectContact />}
      <MainHeader accountId={user.accountId} isLogo />
      <main>{children}</main>
      {isFooterNeeded && <MainFooter />}
      <SnackBar
        type={SnackBarType.ERROR}
        visible={snackBarVisible}
        setVisible={onCloseSnackBar}
        content={snackBarMessage}
      />
    </PrivateLayoutStyled>
  );
};

export default PrivateLayout;
