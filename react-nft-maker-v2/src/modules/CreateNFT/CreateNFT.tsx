import { useCallback, useEffect, useState } from 'react';

import { filter, map, uniq } from 'lodash';

import FullscreenLoader from '@/components/FullscreenLoader';
import { NFT_CATEGORY_ID } from '@/constants/appId';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import CreateNFTFormWizard from '@/modules/CreateNFT/CreateNFTFormWizard';
import DataPreviewWizard from '@/modules/CreateNFT/DataPreviewWizard';
import ImageSelectionWizard from '@/modules/CreateNFT/ImageSelectionWizard';
import { CreateNFTData } from '@/services/nft/create.service';
import { giftNftService } from '@/services/nft/gift.service';
import { getAuthDataSelector, setJustSignedUp } from '@/store/auth';
import { getContactsSelector } from '@/store/contacts/contactsSelector';
import { openAndCloseContactDialog } from '@/store/dialogs/dialogsSlice';
import { getNftSelector, sendNftSuccess } from '@/store/nft';
import { createNftThunk, changeStep, nftAdConversionThunk } from '@/store/nft/nftSlice';
import { queryClient } from '@/utils/queryClient';

import {
  DialogCreateNFTWorkflow,
  DivContainer,
  DivProgress,
  DivProgressContainer,
  DivTabContainer,
} from './CreateNFT.styles';

interface IProps {
  handleClose: () => void;
  toShare?: boolean;
  handleShared?(): void;
  setParentError?(m: string): void;
}

const CreateNFT = (props: IProps) => {
  const { handleClose, toShare, handleShared, setParentError } = props;
  const isMobile = useIsMobile();

  const dispatch = useAppDispatch();

  const [progress, setProgress] = useState<number>(0);
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    data: { title, description, attributesData },
    fromScreen,
    selectedFile,
    allNfts = [],
  } = useAppSelector(getNftSelector);
  const {
    user: { userId, walletId },
    token,
    actionWalletId,
  } = useAppSelector(getAuthDataSelector);
  const { selectedContacts } = useAppSelector(getContactsSelector);

  const handleLocalClose = (event: object, reason: 'backdropClick' | 'escapeKeyDown' | 'buttonClick') => {
    if ((reason && reason == 'backdropClick') || allNfts.length === 0) return;
    handleClose();
  };

  const nextStep = useCallback(() => {
    setStep((step) => Math.min(step + 1, 4));
  }, []);

  const setSuccessInRedux = (nftData: any): void => {
    dispatch(openAndCloseContactDialog(false));
    dispatch(setJustSignedUp(false));
    dispatch(
      nftAdConversionThunk({
        ['transaction_id']: nftData.transactionId,
        userWallet: nftData.ownerWalletId,
        categoryId: nftData.categoryId,
        description: nftData.description,
        title: nftData.title,
      })
    );
    queryClient.invalidateQueries(['nftListData', userId]);
  };

  const handleSendNFT = async (nftData: any) => {
    const handleError = (skipThrow?: boolean): void => {
      const errorText = 'NFT could not be shared';
      if (setParentError) setParentError(errorText);
      if (!skipThrow) throw new Error(errorText);
    };

    if (nftData.nftId) {
      try {
        const contactIds = filter(uniq(map(selectedContacts, (contact) => contact.contactId)), (id) => !!id);

        const response = await giftNftService({
          nftId: nftData.nftId,
          body: {
            contactIds: Array.isArray(contactIds) ? contactIds : [contactIds],
          },
        });
        if (response.status === 200) {
          dispatch(sendNftSuccess(nftData.nftId));
          setSuccessInRedux(nftData);
          if (handleShared) handleShared();
        } else {
          handleError(true);
        }
      } catch (error) {
        handleError();
      }
    } else {
      handleError(true);
    }
  };

  const createNft = async () => {
    const selectedWalletId = actionWalletId || walletId;
    if (!token) {
      throw new Error('Token is required');
    }
    if (!selectedWalletId) {
      throw new Error('Wallet ID is required');
    }

    const body: CreateNFTData = {
      title,
      description,
      tags:
        attributesData?.ids.map((id) => {
          const attribute = attributesData?.data[id];
          return attribute.attributeName || 'dummy';
        }) ?? [],
      categoryId: NFT_CATEGORY_ID,
      filePath: '',
    };

    setLoading(true);

    const responseNft = await dispatch(
      createNftThunk({
        file: selectedFile,
        body,
        token,
        walletId: actionWalletId ?? '',
        ownerId: userId ?? '',
      })
    );

    setLoading(false);
    const nftData = responseNft?.payload?.data;

    if (!nftData) {
      return;
    }

    if (toShare) {
      handleSendNFT(nftData);
    } else {
      dispatch(changeStep('success'));
      setSuccessInRedux(nftData);
      dispatch(setJustSignedUp(false));
    }
  };

  const handleBack = useCallback(() => {
    setStep((step) => Math.max(step - 1, 0));
  }, []);

  const progressObjs: { [key: number]: number } = {
    0: fromScreen === 'contactModal' ? 10 : 0,
    1: 40,
    2: 90,
    3: 100,
  };

  useEffect(() => {
    setProgress(progressObjs?.[step]);
  }, [step]);

  return (
    <DialogCreateNFTWorkflow
      open
      isMobile={isMobile}
      title={'Create an NFT'}
      maxWidth="sm"
      onClose={handleLocalClose}
      onBack={handleBack}
      disableBack={step === 0}
      showClose={(allNfts && allNfts.length > 0) || false}
      crossIconPosition={{
        top: '-4px',
        right: '-6px',
      }}
    >
      {loading && <FullscreenLoader />}
      <DivProgressContainer>
        <DivProgress progress={progress} />
      </DivProgressContainer>
      <DivContainer>
        <DivTabContainer visible={step === 0}>
          <ImageSelectionWizard setProgress={setProgress} handleNext={nextStep} />
        </DivTabContainer>
        <DivTabContainer visible={step === 1}>
          <CreateNFTFormWizard setProgress={setProgress} handleNext={nextStep} />
        </DivTabContainer>
        <DivTabContainer visible={step === 2}>
          <DataPreviewWizard setProgress={setProgress} handleNext={createNft} />
        </DivTabContainer>
      </DivContainer>
    </DialogCreateNFTWorkflow>
  );
};

export default CreateNFT;
