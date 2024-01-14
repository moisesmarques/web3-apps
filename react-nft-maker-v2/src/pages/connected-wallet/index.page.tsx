import { useRouter } from 'next/router';

import { useState, useEffect, Fragment, useCallback } from 'react';

import Grid from '@mui/material/Grid';

import { DoubleArrow } from '@/assets/svg/double-arrow';
import CommonDialog from '@/components/core/CommonDialog';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import Header from '@/components/DynamicHeader';
import WalletItem from '@/components/WalletItem';
import { WalletEvent } from '@/components/WalletItem/WalletItem.type';
import { ACCOUNT_ID_PREFIX } from '@/constants/api';
import { useWalletData } from '@/hooks/apis/useWalletData';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import AddWalletForm from '@/modules/AddWalletForm';
import VerificationForm from '@/modules/VerificationForm';
import { getAuthDataSelector, setWalletDraft, removeWallet, setActionWalletId, switchWallet } from '@/store/auth';
import { ICreateWalletServiceRequestProps } from '@/store/wallet/types';

import {
  DivContainer,
  DivTopContainer,
  DivTopTitle,
  AddWalletButton,
  DivFormWrapper,
  DivDoubleArrowWrapper,
  DivAuthHeading,
} from './index.style';

/**
 *
 * @returns ConnectedWallet page
 */
const ConnectedWallet = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: walletData } = useWalletData();
  const [openAddWallet, setOpenAddWallet] = useState(false);
  const [openVerification, setOpenVerification] = useState(false);
  const [walletUpdated, setWalletUpdated] = useState(false);
  const [walletUpdatedMessage, setWalletUpdatedMessage] = useState('');
  const [event, setEvent] = useState<WalletEvent | null>();
  const [eventToggle, setEventToggle] = useState<boolean>(false);
  const { user, allWallet = [], actionWalletId } = useAppSelector(getAuthDataSelector);
  const { error, isLoading } = useAppSelector((state) => state.wallets);

  useEffect(() => {
    if (event && event !== WalletEvent.CREATE) setOpenVerification(true);
    if (!error && !isLoading) setOpenAddWallet(false);
  }, [event, eventToggle, error, isLoading]);

  const handleSwitchWallet = async () => {
    const wallet = allWallet.find(({ walletId }) => walletId === actionWalletId);
    await dispatch(switchWallet(wallet));
    setOpenVerification(false);
    await dispatch(setActionWalletId(''));
    setEvent(null);
    router.push({
      pathname: '/settings',
      query: { switched: true },
    });
  };

  const handleClickAddWallet = () => {
    setEvent(WalletEvent.CREATE);
    setOpenAddWallet(true);
  };

  const handleRemoveWallet = async () => {
    const wallets = allWallet.filter((item) => item.walletId !== actionWalletId);
    await dispatch(removeWallet(wallets));
    setOpenVerification(false);
    setWalletUpdated(true);
    setWalletUpdatedMessage('Wallet Deleted Successfully');
    await dispatch(setActionWalletId(''));
    setEvent(null);
  };

  const handleCreateWallet = useCallback(() => {
    setOpenVerification(false);
    if (error) {
      setWalletUpdatedMessage('Created wallet failed');
    } else if (!isLoading && !error) {
      setWalletUpdatedMessage('New Wallet Added Successfully');
    }
    if (!isLoading) setWalletUpdated(true);
    setEvent(null);
  }, [isLoading, error]);

  const handleAddWallet = ({ email, phone }: ICreateWalletServiceRequestProps) => {
    const walletId = `${email?.split('@')[0]}` + ACCOUNT_ID_PREFIX;
    dispatch(setWalletDraft({ phone, walletId }));
    handleCreateWallet();
  };

  return (
    <Fragment>
      {walletUpdated && !isLoading && (
        <SnackBar
          setVisible={setWalletUpdated}
          visible={walletUpdated}
          content={walletUpdatedMessage}
          type={error ? SnackBarType.ERROR : SnackBarType.SUCCESS}
        />
      )}
      <AddWalletForm openModal={openAddWallet} setOpenModal={setOpenAddWallet} onSubmit={handleAddWallet} />
      {openVerification && event !== WalletEvent.CREATE && (
        <CommonDialog open={openVerification} onClose={() => setOpenVerification(false)} title="">
          <Grid container>
            <Grid item md={12} sm={12} xs={12}>
              <DivDoubleArrowWrapper>
                <DoubleArrow />
              </DivDoubleArrowWrapper>
              <DivAuthHeading data-testid="verification-heading">Authentication</DivAuthHeading>
            </Grid>
          </Grid>
          <DivFormWrapper className="form-wrapper">
            <p>We've sent a 6-digit verification code to your {user.type}</p>
            <p className="sub-heading">{user.type === 'email' ? user.email : user.phone}</p>
            <VerificationForm onSubmit={event === WalletEvent.SWITCH ? handleSwitchWallet : handleRemoveWallet} />
          </DivFormWrapper>
        </CommonDialog>
      )}
      <Header title="All Wallets" isBackButton left />
      <DivContainer>
        <DivTopContainer>
          <DivTopTitle>Total Wallets ({walletData?.length})</DivTopTitle>
          <AddWalletButton onClick={handleClickAddWallet}>+ Add Wallet</AddWalletButton>
        </DivTopContainer>
        <Grid container spacing={2}>
          {walletData?.map((wallet) => (
            <Grid key={wallet?.walletId} item md={6} sm={12} xs={12}>
              <WalletItem
                setEvent={setEvent}
                toggle={eventToggle}
                setEventToggle={setEventToggle}
                data={wallet}
                selected={user.walletId === wallet.walletId}
              />
            </Grid>
          ))}
        </Grid>
      </DivContainer>
    </Fragment>
  );
};

export default ConnectedWallet;
