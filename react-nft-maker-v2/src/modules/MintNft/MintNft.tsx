import { useState } from 'react';

import { Breakpoint } from '@mui/material';

import CommonDialog from '@/components/core/CommonDialog';
import { AlignTitleType } from '@/components/core/CommonDialog/CommonDialog.types';
import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getNftSelector } from '@/store/nft';

import Open from './Open';
import Preview from './Preview';
import Sucess from './Success';

interface IProps {
  open: boolean;
  onClose: () => void;
}

export interface StepProps {
  changeStep: (step: MintStep) => void;
  setModalState: (modalState: ModalState) => void;
}

export type MintStep = 'preview' | 'success' | 'open';

export const NFTData = {
  category: 'Digital Art',
  title: 'Vecotry Illustration ',
  id: '#17372',
  fileUrl: '',
  creator: {
    name: 'john_doe',
  },
  tags: ['Ditial Art', 'Vector'],
};

interface ModalState {
  title: string;
  maxWidth: Breakpoint;
  alignTitle?: AlignTitleType | null;
}

const MintNft = ({ open, onClose }: IProps) => {
  const [step, setStep] = useState<MintStep>('preview');
  const [modalState, setModalState] = useState<ModalState>({
    title: 'Create an NFT',
    maxWidth: 'md',
    alignTitle: null,
  });

  const { allNfts } = useAppSelector(getNftSelector);

  const changeStep = (step: MintStep) => {
    setStep(step);
  };

  const renderStep = (step: MintStep) => {
    switch (step) {
      case 'preview':
        return <Preview changeStep={changeStep} setModalState={setModalState} />;
      case 'success':
        return <Sucess changeStep={changeStep} setModalState={setModalState} />;
      case 'open':
        return <Open changeStep={changeStep} setModalState={setModalState} />;
      default:
        return null;
    }
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title={modalState.title}
      maxWidth={modalState.maxWidth}
      {...(modalState.alignTitle && { alignTitle: modalState.alignTitle })}
      showClose={(allNfts && allNfts.length > 0) || false}
    >
      {renderStep(step)}
    </CommonDialog>
  );
};

export default MintNft;
