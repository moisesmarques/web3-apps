import React, { useEffect, useState } from 'react';

import { AlertColor } from '@mui/material/Alert/Alert';
import parsePhoneNumber from 'libphonenumber-js';

import { ArrowRightBlue } from '@/assets/svg/arrow-right-blue';
import { GoogleIconBlue } from '@/assets/svg/google-icon-blue';
import { InfoIcon } from '@/assets/svg/InfoIcon';
import CommonDialog from '@/components/core/CommonDialog';
import SnackBar from '@/components/core/SnackBar';
import FullscreenLoader from '@/components/FullscreenLoader';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getContactsList, importContactService } from '@/services/contact/contact.service';
import { getAuthDataSelector } from '@/store/auth';
import { setSkipContact } from '@/store/auth/authSlice';
import {
  getContactsSelector,
  setAllContacts,
  setSelectContactModalOpen,
  setSelectedContacts,
  toggleImportModal,
} from '@/store/contacts';
import { getNftSelector } from '@/store/nft';
import { removeNumbersFromString } from '@/utils/helper';

import {
  DivButtonTitleContent,
  DivButtonTitleWrapper,
  DivImportButton,
  DivImportButtonContent,
  DivImportContact,
  SkipImportButton,
  SkipImportButtonLabel,
  ImportButton,
  InfoText,
} from './index.styles';
import { CustomWindow, ImportContact, ImportContactsProps } from './index.type';

// declare custom window with cloud type props
declare let window: CustomWindow;

/**
 *
 * @returns Modal import contacts
 */
const ImportContacts = ({
  resetState,
  onSkip,
  addManual,
  toggleLocal,
}: {
  resetState?: () => void;
  onSkip?: () => void;
  addManual?: () => void;
  toggleLocal?: () => void;
}) => {
  const [showToast, setShowToast] = useState<{ content: string; type: AlertColor }>();
  const { importContacts } = useAppSelector(getContactsSelector);
  const { user } = useAppSelector(getAuthDataSelector);
  const { allNfts = [] } = useAppSelector(getNftSelector);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const toggleModal = (shouldReset = true) => {
    if (toggleLocal) {
      toggleLocal();
    } else {
      dispatch(toggleImportModal());
      setSelectContactModalOpen();
      if (shouldReset) {
        if (resetState) return resetState();
      }
    }
  };

  const onCloseModal = () => {
    toggleModal();
  };

  const LoadCloudSponge = (callback: any) => {
    const existingScript: any = document.getElementById('cloudSponge');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // for localhost testing
      script.src = 'https://api.cloudsponge.com/widget/localhost-only.js';
    } else {
      // for production
      script.src = 'https://api.cloudsponge.com/widget/l8UL7ckxBgjk0bLDQv5gzA.js';
    }

    script.id = 'cloudSponge';
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };

    if (existingScript && callback) callback();
  };

  const saveContactsAtBackend = async (contacts: ImportContact[]) => {
    setIsLoading(true);
    try {
      // add owner info to contacts
      const setPhoneNumber = (number: string) => {
        const phoneNumber = parsePhoneNumber(number);
        return phoneNumber?.number || number.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
      };
      const contactNumbers = contacts.map((contact: any) => {
        const addresses = contact.address.map((i: any) => {
          const { street, city, region, country } = i;
          const postalCode = i['postal_code'];
          return { street, city, region, country, postalCode, type: 'other' };
        });
        const email = contact.email.map((i: any) => ({ address: i.address, type: i.type }));
        const phone = contact.phone.map((i: { number: string; primary: boolean; type: string | null }) => ({
          number: setPhoneNumber(i.number),
          type: i.type,
        }));
        const tempContact: ImportContactsProps = {
          address: addresses,
          appId: user.userId,
          companies: contact.companies,
          email,
          firstName: removeNumbersFromString(contact.first_name),
          groups: contact.groups,
          importSource: 'Google',
          jobTitle: contact.job_title,
          lastName: removeNumbersFromString(contact.last_name),
          phone,
        };
        // tempContact = removeAllEmptyData(tempContact);

        return tempContact;
      });
      // Ajax Request to create user
      await importContactService(contactNumbers, user?.userId);
      const response: any = await getContactsList(user.userId);
      dispatch(setAllContacts(response?.data || []));
      dispatch(setSelectedContacts(response?.data || []));
    } catch (error: any) {
      setShowToast({ content: error.message, type: 'error' });
      if (!toggleLocal) dispatch(toggleImportModal());
    }
    setIsLoading(false);
  };
  useEffect(() => {
    dispatch(setSkipContact(false));
    LoadCloudSponge(() => {
      if (window.cloudsponge) {
        window.cloudsponge.init({
          skipContactsDisplay: false,
          skipSourceMenu: true,
          browserContactCacheMin: false,
          rootNodeSelector: '#cloudsponge-widget-container',
          beforeDisplayContacts(contacts: ImportContact[]) {
            if (contacts.length === 0) {
              setShowToast({ content: 'No contacts found', type: 'info' });
            } else {
              if (!toggleLocal) toggleModal();
              saveContactsAtBackend(contacts);
            }
            const all = document.getElementsByClassName('initial__modal') as HTMLCollectionOf<HTMLElement>;
            for (let i = 0; i < all.length; i++) {
              all[i].style.display = 'block';
            }
            if (resetState) resetState();
            return false;
          },
          beforeLaunch() {
            const all1 = document.getElementsByClassName('initial__modal') as HTMLCollectionOf<HTMLElement>;
            for (let i = 0; i < all1.length; i++) {
              all1[i].style.display = 'none';
            }
          },
          beforeClosing() {
            const all1 = document.getElementsByClassName('initial__modal') as HTMLCollectionOf<HTMLElement>;
            for (let i = 0; i < all1.length; i++) {
              all1[i].style.display = 'block';
            }
          },
          afterImport() {
            const all = document.getElementsByClassName('contactDialogBack') as HTMLCollectionOf<HTMLElement>;
            for (let i = 0; i < all.length; i++) {
              all[i].style.visibility = 'hidden';
            }
            // const sourceTitle =
            //   source === 'office365' ? 'Microsoft 365' : source === 'icloud' ? 'Apple Contacts (iCloud)' : 'Google';
            // callback(!success, sourceTitle);
            // dispatch(changeStep('create'));
            localStorage.setItem('importContact', 'true');
            setIsLoading(false);
          },
          afterClosing() {},
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!toggleLocal) toggleModal(false);
  }, []);

  const openInfo = (): void => {
    if (onSkip && addManual) setShowInfo(!showInfo);
  };

  const addManualContacts = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e.preventDefault();
    if (addManual) {
      addManual();
    }
  };

  const skipImport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e.preventDefault();
    if (onSkip) {
      onSkip();
      dispatch(setSkipContact(true));
    }
  };

  const doubleLine = (): JSX.Element => {
    return (
      <>
        <br />
        <br />
      </>
    );
  };

  const renderIcon = () => {
    if (onSkip && addManual) return <InfoIcon width={20} />;
    if (showInfo) return <></>;
  };

  return (
    <>
      {!!showToast && (
        <SnackBar
          type={showToast.type}
          visible={!!showToast}
          setVisible={(isVisible) => {
            if (!isVisible) {
              setShowToast(undefined);
            }
          }}
          content={showToast.content}
        />
      )}
      {loading && <FullscreenLoader />}
      <CommonDialog
        open={allNfts.length ? importContacts : true}
        onClose={onCloseModal}
        title={showInfo ? 'Contact Import is optional' : 'Import your contacts to generate and share your NFT'}
        altClose
        // altIcon={showInfo ? <></> : <InfoIcon width={20} />}
        altIcon={renderIcon()}
        altFunc={openInfo}
      >
        <DivImportContact data-testid="import-contacts-modal">
          {showInfo && (
            <>
              <InfoText>
                Contact Import is used to share the NFT you create with your friends and invite them to try the app
                themselves.
                {doubleLine()}
                We need contacts so that we know the number of NFTs to create in a series, if we allow people to
                manually enter a series size it would be easy for anyone to spam the system without sending to users.
                {doubleLine()}
                This is also why we only create 1 nft when a user mints it to their own wallet.
                {doubleLine()}
                Your contacts are imported using CloudSponge.com, and encrypted so only you can authorize access to
                them.
                {doubleLine()}
                Emails & Texts you authorize the App to send are sent with Customer.io, where your information is
                immediately afterward.
                {doubleLine()}
                We have built a system where users own their data. Revoke access to your contacts at any time.
              </InfoText>
            </>
          )}
          <DivImportButton>
            <ImportButton className={`cloudsponge-launch`} data-cloudsponge-source="gmail">
              <DivButtonTitleWrapper>
                <DivImportButtonContent>
                  <GoogleIconBlue />
                  <DivButtonTitleContent>Sign in with Google</DivButtonTitleContent>
                  <ArrowRightBlue />
                </DivImportButtonContent>
              </DivButtonTitleWrapper>
            </ImportButton>
          </DivImportButton>
          {addManual && (
            <SkipImportButton onClick={addManualContacts}>
              <SkipImportButtonLabel>Add Manual Contacts</SkipImportButtonLabel>
            </SkipImportButton>
          )}
          {onSkip && (
            <SkipImportButton onClick={skipImport}>
              <SkipImportButtonLabel>Skip Sharing & Mint 1 NFT</SkipImportButtonLabel>
            </SkipImportButton>
          )}
        </DivImportContact>
      </CommonDialog>
    </>
  );
};

export default ImportContacts;
