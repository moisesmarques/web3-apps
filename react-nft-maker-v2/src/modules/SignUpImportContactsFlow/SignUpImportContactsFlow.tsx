import React, { useState, useEffect } from 'react';

import FullscreenLoader from '@/components/FullscreenLoader';
import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import CreateContact from '@/modules/CreateContact';
import CreateNFT from '@/modules/CreateNFT';
import ImportContacts from '@/modules/ImportContacts';
import SelectContact from '@/modules/SelectContact';
import { setNewSignupFlowStep, getAuthDataSelector } from '@/store/auth';
import { NewSignupFlowStep } from '@/store/auth/types';

interface Props {
  toggleSignupImportFlow(): void;
  setError(m: string): void;
}

export default function SignUpImportContactsFlow({ toggleSignupImportFlow, setError }: Props): JSX.Element {
  const { newSignupFlowStep } = useAppSelector(getAuthDataSelector);

  const [step, setStep] = useState<NewSignupFlowStep>(newSignupFlowStep || NewSignupFlowStep.importContact);
  const [toShare, setToShare] = useState<boolean>(false);

  useEffect(() => {
    if (newSignupFlowStep) {
      setStep(newSignupFlowStep);
    }
  }, [newSignupFlowStep]);

  const changeStep = (newStep: NewSignupFlowStep) => {
    setStep(newStep);
    setNewSignupFlowStep(newStep);
  };

  const handleCreateClose = (): void => {
    changeStep(NewSignupFlowStep.importContact);
    toggleSignupImportFlow();
  };

  const openSendNFT = (): void => {
    setToShare(true);
    changeStep(NewSignupFlowStep.createNft);
  };

  const skipAndMint = (): void => {
    setToShare(false);
    changeStep(NewSignupFlowStep.createNft);
  };

  const renderStep = (): JSX.Element => {
    switch (step) {
      case NewSignupFlowStep.importContact:
        return (
          <ImportContacts
            resetState={() => changeStep(NewSignupFlowStep.selectContact)}
            onSkip={() => changeStep(NewSignupFlowStep.createNft)}
            addManual={() => {
              changeStep(NewSignupFlowStep.createContact);
            }}
            toggleLocal={() => {
              toggleSignupImportFlow();
            }}
          />
        );
      case NewSignupFlowStep.createContact:
        return (
          <CreateContact
            localOpen={step === NewSignupFlowStep.createContact}
            localToggle={() => changeStep(NewSignupFlowStep.selectContact)}
          />
        );
      case NewSignupFlowStep.selectContact:
        return (
          <SelectContact
            isManual
            localOpen={step === NewSignupFlowStep.selectContact}
            localToggle={toggleSignupImportFlow}
            toCreate={() => changeStep(NewSignupFlowStep.createNft)}
            toGift={openSendNFT}
            justMint={skipAndMint}
            toggleManualFlow={toggleSignupImportFlow}
          />
        );
      case NewSignupFlowStep.createNft:
        return (
          <CreateNFT
            handleClose={handleCreateClose}
            toShare={toShare}
            handleShared={() => {
              changeStep(NewSignupFlowStep.loading);
            }}
            setParentError={setError}
          />
        );
      case NewSignupFlowStep.loading:
        return <FullscreenLoader />;
      default:
        return <></>;
    }
  };

  return <>{renderStep()}</>;
}
