import { Fragment, useState } from 'react';

import { SelectedWallet } from '@/assets/svg/selected-wallet';
import { UnselectedWallet } from '@/assets/svg/unselected-wallet';
import { WalletIcon } from '@/assets/svg/wallet-icon';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import { useAppDispatch } from '@/hooks/useReduxTypedHooks';
import { setActionWalletId } from '@/store/auth';
import { Wallet } from '@/store/auth/types';

import {
  DivWrapper,
  DivSelection,
  SpanConnected,
  SectionContent,
  SpanTitle,
  SpanLabel,
  SpanValue,
  SpanCursorPointer,
  DivContent,
  DivDeleteWallet,
} from './WalletItem.styles';
import { WalletEvent } from './WalletItem.type';

interface IWalletItemProps {
  selected: boolean;
  toggle: boolean;
  data: Wallet;
  setEvent: (event: WalletEvent) => void;
  setEventToggle: (toggle: boolean) => void;
}

const WalletItem = ({ data, selected, setEvent, toggle, setEventToggle }: IWalletItemProps) => {
  const dispatch = useAppDispatch();
  const [showError, setShowError] = useState<boolean>(false);
  const handleEvent = async (event: WalletEvent) => {
    if (event === WalletEvent.DELETE && selected) {
      setShowError(true);
    } else {
      await dispatch(setActionWalletId(data.walletId));
      setEventToggle(!toggle);
      setEvent(event);
    }
  };

  return (
    <DivWrapper>
      {showError && (
        <SnackBar
          setVisible={setShowError}
          visible={showError}
          content="Connected wallet can't be deleted"
          type={SnackBarType.ERROR}
        />
      )}
      <WalletIcon />
      <DivContent>
        <SectionContent>
          <SpanTitle>{data.walletId}</SpanTitle>
        </SectionContent>
        <SectionContent>
          <SpanLabel>Name</SpanLabel>
          <SpanValue>{data.fullName}</SpanValue>
        </SectionContent>
        <SectionContent>
          <SpanLabel>Email Address</SpanLabel>
          <SpanValue>{data.email}</SpanValue>
        </SectionContent>
        <SectionContent>
          <SpanLabel>Phone number</SpanLabel>
          <SpanValue>{data.phone}</SpanValue>
        </SectionContent>
        <DivDeleteWallet onClick={() => handleEvent(WalletEvent.DELETE)}>Delete Wallet</DivDeleteWallet>
        <DivSelection>
          {selected ? (
            <Fragment>
              <SpanConnected>Connected</SpanConnected>
              <SpanCursorPointer>
                <SelectedWallet />
              </SpanCursorPointer>
            </Fragment>
          ) : (
            <SpanCursorPointer onClick={() => handleEvent(WalletEvent.SWITCH)}>
              <UnselectedWallet />
            </SpanCursorPointer>
          )}
        </DivSelection>
      </DivContent>
    </DivWrapper>
  );
};

export default WalletItem;
