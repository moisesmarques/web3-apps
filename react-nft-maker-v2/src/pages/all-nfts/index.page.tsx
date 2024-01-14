import { useRouter } from 'next/router';

import { useEffect, useState } from 'react';

import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import FullscreenLoader from '@/components/FullscreenLoader';
import { PrivateLayout } from '@/components/Layout';
import { useNftListData } from '@/hooks/apis/nft/useNftListData';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import CreateNFT from '@/modules/CreateNFT';
import CreateNFTSuccess from '@/modules/CreateNFTSuccess/CreateNFTSuccess';
import NftList from '@/modules/NftList';
import NftListBanner from '@/modules/NftList/NftListBanner';
import SendNft from '@/modules/SendNft';
import SendNFTSuccess from '@/modules/SendNFTSuccess/SendNFTSuccess';
import SignUpImportContactsFlow from '@/modules/SignUpImportContactsFlow';
import SingleNft from '@/modules/SingleNft';
import TransactionList from '@/modules/TransactionList';
import { getAuthDataSelector } from '@/store/auth';
import { resetVerificationStatus, setSkipContact } from '@/store/auth/authSlice';
import { setReturnUrl } from '@/store/common/commonSlice';
import { clearErrors, getContactsSelector, toggleSelectContactModal } from '@/store/contacts';
import { getContactsThunk, toggleImportModal } from '@/store/contacts/contactsSlice';
import { getDialogsStatus } from '@/store/dialogs/dialogsSelector';
import { closeCreateNftDialog, closeSendNftDialog } from '@/store/dialogs/dialogsSlice';
import { getNftSelector, getNtfCreateStatus, resetStep } from '@/store/nft';
import { changeStep, clearNftErrors } from '@/store/nft/nftSlice';

import { DivContainer } from './index.styles';

const AllNFTs = (): JSX.Element => {
  const {
    data: { fileUrl },
    sendNftSuccess: sendNftSuccessId,
    status: nftStatus,
    error: nftErrorMessage,
  } = useAppSelector(getNftSelector);
  const { currentStep } = useAppSelector(getNtfCreateStatus);
  const { user, skipContactAndMint, justSignedUp } = useAppSelector(getAuthDataSelector);
  const { allContacts, allContactsLoading, loadingMessage, listContactsError } = useAppSelector(getContactsSelector);
  const { data, isLoading } = useNftListData();
  const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const [prefetchImage, setPrefetchImage] = useState<string | undefined | null>();
  const [signupImportContactsOpen, setSignupImportContactsOpen] = useState<boolean>(justSignedUp || false);

  useEffect(() => {
    if (justSignedUp !== undefined) {
      setSignupImportContactsOpen(justSignedUp);
    }
  }, [justSignedUp]);

  const router = useRouter();
  const { returnUrl } = useAppSelector((state) => state.commonData);
  const dispatch = useAppDispatch();

  const { isSendNftDialogOpen, isCreateNftDialogOpen } = useAppSelector(getDialogsStatus);

  const handleClose = (): void => {
    dispatch(closeCreateNftDialog());
    dispatch(resetStep());
    dispatch(setSkipContact(false));
  };

  const handleCloseSendNftDialog = () => {
    dispatch(closeSendNftDialog());
  };

  const onCloseSnackBar = () => {
    setSnackBarMessage('');
    setSnackBarVisible(false);
    dispatch(clearErrors());
    dispatch(clearNftErrors());
  };

  useEffect(() => {
    dispatch(getContactsThunk(user.userId));
    dispatch(resetVerificationStatus());
    dispatch(changeStep(null));
  }, []);

  useEffect(() => {
    if (!isLoading && !data?.length && !allContacts.length) {
      dispatch(toggleSelectContactModal());
    }
  }, [data, isLoading]);

  useEffect(() => {
    const nftStatusError = nftStatus === 'error';
    const errorMsg = listContactsError || nftErrorMessage || '';
    if (listContactsError.length > 0 || nftStatusError) {
      setSnackBarVisible(true);
      setSnackBarMessage(errorMsg);
      dispatch(toggleImportModal());
    }
  }, [listContactsError, nftStatus]);

  useEffect(() => {
    if (returnUrl) {
      router.push(returnUrl);
      setReturnUrl('');
    }
  }, [returnUrl]);

  const getImagesFromUrl = async (url: string | undefined | any) => {
    const response = await fetch(url);
    const imageBlob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(imageBlob);
    reader.onloadend = () => {
      const base64data = reader.result as string; // readAsDataURL return data:*/*;base64
      setPrefetchImage(base64data);
    };
  };

  useEffect(() => {
    getImagesFromUrl(fileUrl);
  }, []);

  const setImportsFlowError = (message: string): void => {
    setSnackBarMessage(message);
    setSnackBarVisible(true);
  };

  return (
    <PrivateLayout isFooterNeeded={true} justSignedUp={justSignedUp}>
      {allContactsLoading && <FullscreenLoader message={loadingMessage} />}
      <DivContainer>
        <NftListBanner />
        {signupImportContactsOpen && (
          <SignUpImportContactsFlow
            toggleSignupImportFlow={() => {
              setSignupImportContactsOpen(!signupImportContactsOpen);
            }}
            setError={setImportsFlowError}
          />
        )}
        {currentStep === 'open' && <SingleNft handleClose={handleClose} />}
        {!signupImportContactsOpen && (currentStep === 'create' || isCreateNftDialogOpen) && (
          <CreateNFT handleClose={handleClose} />
        )}
        {skipContactAndMint && currentStep === 'success' && <CreateNFTSuccess handleClose={handleClose} />}
        {!signupImportContactsOpen && sendNftSuccessId && <SendNFTSuccess prefetchImage={prefetchImage} />}
        {!signupImportContactsOpen && isSendNftDialogOpen && <SendNft handleClose={handleCloseSendNftDialog} />}
        <NftList />
        <TransactionList />
      </DivContainer>
      <SnackBar
        type={SnackBarType.ERROR}
        visible={snackBarVisible}
        setVisible={onCloseSnackBar}
        content={snackBarMessage}
      />
    </PrivateLayout>
  );
};

export default AllNFTs;
