import { useRouter } from 'next/router';

import { useEffect } from 'react';

import CommonDialog from '@/components/core/CommonDialog';
// import FullscreenLoader from '@/components/FullscreenLoader';
import MediaItem from '@/components/MediaItem';
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import {
  ButtonOpen,
  DivContainer,
  NftID,
  NftTitle,
  NftTitleMessage,
} from '@/modules/CreateNFTSuccess/CreateNFTSuccess.styles';
import { setJustSignedUp } from '@/store/auth';
import { getContactsSelector, setSelectedContacts } from '@/store/contacts';
import { setSelectedNft } from '@/store/dialogs';
import { closeCreateNftDialog } from '@/store/dialogs/dialogsSlice';
import { getNftSelector, nftDetailsThunk, resetSendNftSuccess, resetStep } from '@/store/nft';

interface ISendNFTSuccessProps {
  prefetchImage?: string | null;
  handleLocalClose?(): void;
}

const SendNFTSuccess = ({ handleLocalClose }: ISendNFTSuccessProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedContacts } = useAppSelector(getContactsSelector);
  const {
    data: { title, fileUrl },
    sendNftSuccess,
  } = useAppSelector(getNftSelector);

  useEffect(() => {
    if (sendNftSuccess) {
      dispatch(nftDetailsThunk(sendNftSuccess));
    }
  }, [sendNftSuccess]);

  const handleOpenDetails = () => {
    dispatch(resetSendNftSuccess());
    dispatch(setSelectedContacts([]));
    dispatch(closeCreateNftDialog());
    dispatch(resetStep());
    dispatch(setJustSignedUp(false));
    router.push('/transactions');
  };

  const handleClose = () => {
    if (handleLocalClose) {
      handleLocalClose();
      dispatch(setSelectedContacts([]));
      dispatch(closeCreateNftDialog());
      dispatch(resetStep());
      dispatch(setJustSignedUp(false));
    } else {
      dispatch(resetSendNftSuccess());
      dispatch(setSelectedNft(''));
      dispatch(setSelectedContacts([]));
      dispatch(closeCreateNftDialog());
      dispatch(resetStep());
      dispatch(setJustSignedUp(false));
    }
  };

  // if (!title) {
  //   return <FullscreenLoader />;
  // }

  const NoOfContact = selectedContacts.filter((value) => Object.keys(value).length !== 0);

  return (
    <CommonDialog open title={''} onClose={handleClose}>
      <DivContainer>
        <MediaItem src={fileUrl} />
        <NftTitle>{title}</NftTitle>
        <NftTitleMessage>sent successfulldfdy to</NftTitleMessage>
        <NftID>
          {NoOfContact.length} contact{NoOfContact.length > 1 && 's'}
        </NftID>
        <ButtonOpen onClick={handleOpenDetails} backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
          Open History
        </ButtonOpen>
      </DivContainer>
    </CommonDialog>
  );
};

export default SendNFTSuccess;
