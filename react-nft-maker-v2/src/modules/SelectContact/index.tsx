import React, { useCallback, useEffect, useState } from 'react';

import { Avatar, InputAdornment } from '@mui/material';
import { map, uniq, filter } from 'lodash';

import { ArrowRight } from '@/assets/svg/arrow-right';
import { PlusIcon } from '@/assets/svg/plus-icon';
import { SearchIcon } from '@/assets/svg/search-icon';
import { SelectedContactIcon } from '@/assets/svg/selected-contact';
import CommonDialog from '@/components/core/CommonDialog';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import FullscreenLoader from '@/components/FullscreenLoader';
import { NFT_CATEGORY_ID } from '@/constants/appId';
import { useGiftNftMutation } from '@/hooks/apis/nft/useGiftNftMutation';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import CreateContact from '@/modules/CreateContact';
import ImportContacts from '@/modules/ImportContacts';
import { ImportContact } from '@/modules/SelectContact/index.type';
import { getContactsList } from '@/services/contact/contact.service';
import { CreateNFTData } from '@/services/nft/create.service';
import { getAuthDataSelector, setJustSignedUp } from '@/store/auth';
import {
  getContactsSelector,
  setAllContacts,
  setSelectedContacts,
  toggleAddContactModal,
  toggleSelectContactModal,
} from '@/store/contacts';
import { openAndCloseContactDialog, setIsSelectContactLater, resetSelectedNft } from '@/store/dialogs';
import { getDialogsStatus } from '@/store/dialogs/dialogsSelector';
import { closeCreateNftDialog, openSendNftDialog, resetProcess } from '@/store/dialogs/dialogsSlice';
import { getNtfCreateStatus, getNftSelector, resetStep } from '@/store/nft';
import {
  changeStep,
  setFromScreen,
  createNftThunk,
  setSelectedFile,
  setAttributeData,
  nftAdConversionThunk,
} from '@/store/nft/nftSlice';
import { queryClient } from '@/utils/queryClient';

import {
  BlueTitle,
  ButtonSend,
  DivButtonWrapper,
  DivContact,
  DivContactDetails,
  DivContactInfo,
  DivContactsList,
  DivContactSubTitle,
  DivContactTitle,
  DivContactWrapper,
  DivSelectContact,
  DivSelectedIcon,
  DivTitle,
  SearchBar,
  ManualButtonWrapper,
  ButtonSkip,
} from './index.styles';

interface Props {
  isManual?: boolean;
  localOpen?: boolean;
  localToggle?(): void;
  toCreate?(): void;
  toGift?(): void;
  justMint?(): void;
  toggleManualFlow?(): void;
}

/**
 *
 * @returns Modal Select contacts
 */

const SelectContact = ({ isManual, localOpen, localToggle, toCreate, toGift, justMint, toggleManualFlow }: Props) => {
  const { selectContactDialog, allContacts, selectedContacts } = useAppSelector(getContactsSelector);
  const { token, user } = useAppSelector(getAuthDataSelector);
  const { isSelectContactOpen, isSelectContactLater, selectedNftId } = useAppSelector(getDialogsStatus);

  const { currentStep } = useAppSelector(getNtfCreateStatus);
  const [displayData, setDisplayData] = useState<any[]>(allContacts);
  const [openImportModal, setOpenImportModal] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string>('');

  const {
    data: { title, description, attributesData },
    status: nftLoadingStatus,
    selectedFile,
    allNfts = [],
  } = useAppSelector(getNftSelector);

  const {
    user: { userId, walletId },
    token: authToken,
    actionWalletId,
  } = useAppSelector(getAuthDataSelector);

  const toggleModal = useCallback(() => {
    dispatch(toggleSelectContactModal());
    dispatch(openAndCloseContactDialog(false));
  }, []);

  const { mutate: giftNft } = useGiftNftMutation({
    setLoader,
    toggleModal,
    setError,
    selectedNftId,
  });

  useEffect(() => {
    const getContactsData = async () => {
      if (!allContacts.length && token) {
        const response: any = await getContactsList(user.userId);
        dispatch(setAllContacts(response?.data || []));
        dispatch(setSelectedContacts(response?.data || []));
      }
    };
    getContactsData();
  }, [token]);

  useEffect(() => {
    setDisplayData(getFilteredContact(allContacts));
    if (currentStep) toggleModal();
  }, [allContacts]);

  const findIfChecked = (contactId: any) => !!selectedContacts.find((contact) => contact.contactId === contactId);

  const closeModal = () => {
    if (allNfts.length > 0) {
      dispatch(resetSelectedNft());
      if (!localToggle) dispatch(toggleSelectContactModal());
      dispatch(openAndCloseContactDialog(false));
      dispatch(closeCreateNftDialog());
      dispatch(setSelectedContacts([]));
      dispatch(resetStep());
    }

    if (localToggle) {
      localToggle();
      dispatch(resetProcess());
    }
  };

  const getFilteredContact = (list: any) => {
    const uniqueRecords: any[] = [];
    return list.filter((contactObj: any) => {
      let returnVal = false;
      if (contactObj.email && contactObj.email.length > 0) {
        if (!uniqueRecords.includes(contactObj?.email[0]?.address)) {
          uniqueRecords.push(contactObj.email[0]?.address);
          returnVal = true;
        }
      } else {
        if (!uniqueRecords.includes(contactObj?.phone[0]?.number)) {
          uniqueRecords.push(contactObj.phone[0]?.number);
          returnVal = true;
        }
      }
      return returnVal;
    });
  };

  const addContact = () => dispatch(toggleAddContactModal());
  const importContact = () => {
    setOpenImportModal(!openImportModal);
  };
  const checkAllContacts = () => dispatch(setSelectedContacts(allContacts));
  const clearAllContacts = () => {
    if (selectedContacts.length) dispatch(setSelectedContacts([]));
  };

  const handleToggleContactSelection = (contact: ImportContact) => {
    if (findIfChecked(contact.contactId)) {
      dispatch(setSelectedContacts(selectedContacts.filter((c) => c.contactId !== contact.contactId)));
    } else {
      dispatch(setSelectedContacts([contact, ...selectedContacts]));
    }
  };
  const getFulllName = (contact: ImportContact) =>
    `${contact.firstName ? contact.firstName : ''} ${contact.lastName ? contact.lastName : ''}`;
  const getPrimaryEmail = (contact: ImportContact) => {
    if (contact.email && contact.email.length > 0) {
      return contact.email[0].address || '';
    }
    return '';
  };
  const getPrimaryPhone = (contact: ImportContact) => {
    if (contact?.phone?.length > 0) {
      return contact?.phone[0]?.number || '';
    }
    return '';
  };
  const getSearchResult = (text: string) => {
    const result: any[] = allContacts.filter(
      (data: any) =>
        getFulllName(data).toLowerCase().search(text) !== -1 ||
        getPrimaryEmail(data).toLowerCase().search(text) !== -1 ||
        getPrimaryPhone(data).toLowerCase().search(text) !== -1
    );
    return result;
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement> | any) => {
    const value = event.target.value.toLowerCase();
    const result = getSearchResult(value);
    setDisplayData(getFilteredContact(result));
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
          return attribute.attributeName;
        }) ?? [],
      categoryId: NFT_CATEGORY_ID,
      filePath: '',
    };

    setLoader(true);

    const responseNft = await dispatch(
      createNftThunk({
        file: selectedFile,
        body,
        token: authToken as string,
        walletId: actionWalletId ?? '',
        ownerId: userId ?? '',
      })
    );

    queryClient.refetchQueries(['nftListData', userId]);

    setLoader(false);
    const nftData = responseNft?.payload?.data;

    if (!nftData) {
      return;
    }

    dispatch(
      nftAdConversionThunk({
        ['transaction_id']: nftData.transactionId,
        userWallet: nftData.ownerWalletId,
        categoryId: nftData.categoryId,
        description: nftData.description,
        title: nftData.title,
      })
    );

    dispatch(setSelectedFile(undefined));
    dispatch(setJustSignedUp(false));
    dispatch(setAttributeData(undefined));
  };

  const handleSendNFT = useCallback(() => {
    if (selectedNftId) {
      giftNft({
        nftId: selectedNftId,
        contactIds: filter(uniq(map(selectedContacts, (contact) => contact.contactId)), (id) => !!id),
      });
    } else if (isSelectContactLater) {
      createNft();
      dispatch(setIsSelectContactLater(false));
    } else {
      if (toCreate) {
        toCreate();
      } else {
        dispatch(changeStep('create'));
        dispatch(setFromScreen('contactModal'));
      }
    }
  }, [selectedNftId, selectedContacts]);

  const sendGift = (): void => {
    if (toGift) {
      openSendNftDialog();
      toGift();
    }
  };

  const skipAndMint = (): void => {
    if (justMint) justMint();
  };

  return (
    <CommonDialog
      paperStyle={{ maxWidth: '676px' }}
      maxWidth={'sm'}
      open={localOpen ? localOpen : selectContactDialog || isSelectContactOpen}
      onClose={closeModal}
      title={isManual ? 'Gift an NFT' : 'Send NFT'}
      showClose={allNfts.length > 0}
    >
      {(loader || nftLoadingStatus === 'loading') && <FullscreenLoader />}
      <SnackBar
        content={error}
        visible={error ? true : false}
        setVisible={(isVisible) => setError(isVisible ? error : '')}
        type={SnackBarType.ERROR}
      />
      <CreateContact />
      {openImportModal && toggleManualFlow ? (
        <ImportContacts resetState={importContact} toggleLocal={toggleManualFlow} />
      ) : (
        openImportModal && <ImportContacts resetState={importContact} />
      )}
      <DivSelectContact data-testid="select-contacts-modal">
        <SearchBar
          placeholder="Search contact or add new"
          id="outlined-start-adornment"
          sx={{ m: 1, width: '25ch' }}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment onClick={addContact} position="end">
                <PlusIcon />
              </InputAdornment>
            ),
          }}
        />
        <BlueTitle onClick={importContact}>Import</BlueTitle>
      </DivSelectContact>

      <DivTitle>
        <BlueTitle onClick={selectedContacts?.length < 1 ? checkAllContacts : clearAllContacts}>
          {selectedContacts?.length < 1 ? 'Select All' : 'Deselect All'}
        </BlueTitle>
        {/* <BlueTitle onClick={clearAllContacts}>Clear all</BlueTitle> */}
      </DivTitle>
      <DivContactsList>
        {displayData.map((contact: ImportContact, index: number) => {
          const displayName = `${contact.firstName ? contact.firstName : ''} ${
            contact.lastName ? contact.lastName : ''
          }`;
          const displayAvatarIconText = `${contact.firstName ? contact.firstName[0] : ''}${
            contact.lastName ? contact.lastName[0] : ''
          }`;
          let displayContact;
          if (contact && contact.email && Array.isArray(contact.email) && contact.email.length) {
            displayContact = contact.email[0].address;
          } else if (contact && contact.phone && Array.isArray(contact.phone) && contact.phone.length) {
            displayContact = contact.phone[0].number;
          }
          return (
            <DivContactWrapper key={index}>
              <DivContact>
                <DivContactInfo>
                  <Avatar>{displayAvatarIconText.toUpperCase()}</Avatar>
                  <DivContactDetails>
                    <DivContactTitle>{displayName}</DivContactTitle>
                    <DivContactSubTitle>{displayContact}</DivContactSubTitle>
                  </DivContactDetails>
                </DivContactInfo>
                <DivSelectedIcon onClick={() => handleToggleContactSelection(contact)}>
                  <SelectedContactIcon checked={findIfChecked(contact.contactId)} />
                </DivSelectedIcon>
              </DivContact>
            </DivContactWrapper>
          );
        })}
      </DivContactsList>
      {isManual ? (
        <ManualButtonWrapper>
          <ButtonSend onClick={sendGift} disabled={selectedContacts.length === 0}>
            Send Gift <ArrowRight />
          </ButtonSend>
          <ButtonSkip onClick={skipAndMint}>Skip Sharing & Mint 1 NFT</ButtonSkip>
        </ManualButtonWrapper>
      ) : (
        <DivButtonWrapper>
          <ButtonSend onClick={handleSendNFT} disabled={selectedContacts.length === 0}>
            Send NFT <ArrowRight />
          </ButtonSend>
        </DivButtonWrapper>
      )}
    </CommonDialog>
  );
};

export default SelectContact;
