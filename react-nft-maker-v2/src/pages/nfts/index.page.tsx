import { useCallback } from 'react';

import { PlusIcon } from '@/assets/svg/plus-icon';
import { PrivateLayout } from '@/components/Layout';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import CreateNFT from '@/modules/CreateNFT';
import NftList from '@/modules/NftList';
import { getDialogsStatus } from '@/store/dialogs/dialogsSelector';
import { closeCreateNftDialog, openCreateNftDialog } from '@/store/dialogs/dialogsSlice';
import { resetStep } from '@/store/nft';

import { DivNfts, DivPageHeader, DivPageWrapper, SendButton } from './index.styles';

const AllNFTs = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { isCreateNftDialogOpen } = useAppSelector(getDialogsStatus);

  const handleMintNft = useCallback(() => {
    dispatch(openCreateNftDialog());
  }, []);

  const handleClose = useCallback((): void => {
    dispatch(closeCreateNftDialog());
    dispatch(resetStep());
  }, []);

  return (
    <PrivateLayout isFooterNeeded={true}>
      <DivPageWrapper>
        <DivNfts>
          <DivPageHeader>My NFTs</DivPageHeader>
          <SendButton variant="text" startIcon={<PlusIcon />} onClick={handleMintNft}>
            Mint NFT
          </SendButton>
        </DivNfts>
        <NftList fromTransactionPage />
        {isCreateNftDialogOpen && <CreateNFT handleClose={handleClose} />}
      </DivPageWrapper>
    </PrivateLayout>
  );
};

export default AllNFTs;
