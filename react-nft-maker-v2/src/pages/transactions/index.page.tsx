import { useState } from 'react';

import { CrossBlueArrow } from '@/assets/svg/cross-blue-arrow';
import { PrivateLayout } from '@/components/Layout';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import CreateNFT from '@/modules/CreateNFT';
import SendNft from '@/modules/SendNft';
import TransactionList from '@/modules/TransactionList';
import { DivPageHeader, DivTab, DivTransaction, SendButton, TabButton } from '@/pages/transactions/index.styles';
import { closeSendNftDialog, openSendNftDialog } from '@/store/dialogs';
import { getDialogsStatus } from '@/store/dialogs/dialogsSelector';
import { closeCreateNftDialog } from '@/store/dialogs/dialogsSlice';

const tabs: string[] = ['All', 'Sent', 'Received'];

const AllNFTs = (): JSX.Element => {
  const [currentTab, setCurrentTab] = useState<string>('All');
  const dispatch = useAppDispatch();

  const { isSendNftDialogOpen, isCreateNftDialogOpen } = useAppSelector(getDialogsStatus);

  const handleCloseSendNftDialog = () => {
    dispatch(closeSendNftDialog());
  };

  const handleSendNft = () => {
    dispatch(openSendNftDialog());
  };

  const handleClose = (): void => {
    dispatch(closeCreateNftDialog());
  };

  return (
    <PrivateLayout isFooterNeeded={true}>
      {isSendNftDialogOpen && <SendNft handleClose={handleCloseSendNftDialog} />}
      {isCreateNftDialogOpen && <CreateNFT handleClose={handleClose} />}
      <DivTransaction>
        <DivPageHeader>History</DivPageHeader>
        <DivTab>
          {tabs.map((tab, index) => (
            <TabButton key={index} onClick={() => setCurrentTab(tab)} active={currentTab === tab}>
              {tab}
            </TabButton>
          ))}
        </DivTab>
        <SendButton variant="text" startIcon={<CrossBlueArrow />} onClick={handleSendNft}>
          Send NFT
        </SendButton>
      </DivTransaction>
      <TransactionList currentTab={currentTab} fromTransactionPage={true} />
    </PrivateLayout>
  );
};

export default AllNFTs;
