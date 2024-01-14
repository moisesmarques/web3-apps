import { useRouter } from 'next/router';

import { useCallback, useEffect, useState } from 'react';

import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import { Box, Modal } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Field, Form, Formik } from 'formik';

import { DoubleArrow } from '@/assets/svg/double-arrow';
import { InfoIcon } from '@/assets/svg/info-icon';
import { InfoIconInside } from '@/assets/svg/info-icon-inside';
import { RightMenueIcon } from '@/assets/svg/right-menu-icon';
import { SignOutArrow } from '@/assets/svg/signout-arrow-icon';
import { WalletIcon } from '@/assets/svg/wallet-icon';
import Button from '@/components/core/Button';
import CommonDialog from '@/components/core/CommonDialog';
import Input from '@/components/core/FieldInput';
import Loader from '@/components/core/Loader';
import PhoneInput from '@/components/core/PhoneInput';
import SnackBar from '@/components/core/SnackBar';
import { SnackBarType } from '@/components/core/SnackBar/SnackBar';
import Header from '@/components/DynamicHeader';
import FullscreenLoader from '@/components/FullscreenLoader';
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import DeleteAccount from '@/modules/DeleteAccount';
import DeleteAccountSuccess from '@/modules/DeleteAccountSuccess';
import SeedPhraseError from '@/modules/SeedPhraseError';
import SeedPhraseInfo from '@/modules/SeedPhraseInfo';
import SeedPhraseSuccess from '@/modules/SeedPhraseSuccess';
import VerificationForm from '@/modules/VerificationForm';
import { requestSeedPhrase } from '@/services/seed/seed.service';
import {
  clearError,
  getAuthDataSelector,
  loginUserThunk,
  resetStatus,
  resetUser,
  setActionWalletId,
  switchWallet,
  updateUserThunk,
} from '@/store/auth';
import { verifyDeleteThunk } from '@/store/auth/authSlice';
import { User } from '@/store/auth/types';

// import { ICreateWalletServiceRequestProps } from '@/store/wallet/types';
import {
  Div,
  DivAddButton,
  DivAuthHeading,
  DivBox,
  DivCancelIcon,
  DivCheckBoxIconContainer,
  DivColumn,
  DivConnectedWallet,
  DivContainer,
  DivContent,
  DivContentBold,
  DivDoubleArrowWrapper,
  DivFlexRow,
  DivFormWrapper,
  DividerStyled,
  DivLabel,
  DivModalContainer,
  DivRoundIconContainer,
  DivRow,
  DivSecondContainer,
  DivTitleContainer,
  SpanInfoIcon,
  SpanIconInside,
} from './index.style';

/**
 *
 * @returns Settings page
 */

interface IDataType {
  [key: string]: string | number | boolean | undefined;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: 350,
    sm: 400,
  },
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '21.6px',
  p: 3,
  m: 10,
};
const Settings = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    user,
    allWallet = [],
    status,
    actionWalletId,
    error,
    deleteOtpVerified,
  } = useAppSelector(getAuthDataSelector);
  const className = 'btn-add';

  const [connectedModal, setConnectedModal] = useState(false);
  const [wallet, setWallet] = useState(false);
  const [name, setName] = useState(false);
  const [email, setEmail] = useState(false);
  const [phone, setPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);
  const [isError, setError] = useState<boolean>(false);
  const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const [openVerification, setOpenVerification] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState<Partial<User> | null>(null);
  const [showSuccessSeedModal, setShowSuccessSeedModal] = useState<boolean>(false);
  const [showErrorSeedModal, setShowErrorSeedModal] = useState<boolean>(false);
  const [showInfoSeedModal, setShowInfoSeedModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<boolean>(false);
  const [showSuccessDeleteModal, setShowSuccessDeleteModal] = useState<boolean>(false);

  // Don't remove this once the backend is done we will add this modal
  // const [openModal, setOpenModal] = useState<boolean>(false);
  // const { error, isLoading } = useAppSelector((state) => state.wallets);
  useEffect(() => {
    if (router.query?.switched) {
      setMessage('Wallet Switched Successfully');
      setShowMessage(true);
    }
    router.replace('/settings', undefined, { shallow: true });
  }, []);

  useEffect(() => {
    if (deleteOtpVerified) {
      setOpenVerification(false);
      setShowSuccessDeleteModal(true);
    }
  }, [deleteOtpVerified]);

  useEffect(() => {
    if (status) {
      setMessage(status);
      setShowMessage(true);
      dispatch(resetStatus());
    }
  }, [status]);

  useEffect(() => {
    if (error && error.length > 0) {
      setSnackBarVisible(true);
      setSnackBarMessage(error);
      dispatch(clearError());
    }
  }, [error]);

  const closeConnectedModal = () => {
    setConnectedModal(false);
    // setWallet(false);
    setWallet(false);
    setName(false);
    setEmail(false);
    setPhone(false);
    setOpenVerification(false);
  };

  const handleFormSubmit = async (values: Partial<User>) => {
    if (user.userId) {
      setLoading(true);
      const updatedValues: IDataType = { fullName: '' };
      Object.entries(values).forEach((item) => {
        if (item[1]) {
          updatedValues[item[0]] = item[1];
        }
      });
      if (name) {
        await dispatch(
          updateUserThunk({
            userId: user.userId,
            userData: values?.email
              ? { firstName: values?.firstName, lastName: values?.lastName, email: values?.email }
              : {
                  firstName: values?.firstName,
                  lastName: values?.lastName,
                  phone: user?.phone,
                  countryCode: user?.countryCode,
                },
          })
        );
        closeConnectedModal();
      } else {
        setUpdatedUserData(values);
        handleSubmit(values);
      }
    }
    setLoading(false);
  };

  const openConnectedModal = (type: any) => {
    type?.type === 'wallet' && setWallet(true);
    type?.type === 'name' && setName(true);
    type?.type === 'email' && setEmail(true);
    type?.type === 'phone' && setPhone(true);
    setConnectedModal(true);
  };

  const signOut = async () => {
    await dispatch(resetUser());
    localStorage.clear();
    router.replace('/');
  };

  const openSeedModal = async () => {
    setLoading(true);
    try {
      await requestSeedPhrase(walletName);
      setShowSuccessSeedModal(true);
      setLoading(false);
    } catch (e: any) {
      setMessage(e.message);
      setShowErrorSeedModal(true);
      setLoading(false);
    }
  };

  const {
    user: { accountId, walletName },
  } = useAppSelector(getAuthDataSelector);

  const handleResendOTP = () => {
    dispatch(loginUserThunk({ accountId }));
  };

  const handleSelectWallet = (id: string) => {
    if (!user.phone) {
      setError(true);
      setMessage('Kindly update your mobile number to authenticate');
      setShowMessage(true);
      return;
    }
    handleResendOTP();
    dispatch(setActionWalletId(id));
    closeConnectedModal();
    setOpenVerification(true);
  };

  const handleSwitchWallet = async () => {
    setWallet(false);
    const wallet = allWallet.find(({ walletId }) => walletId === actionWalletId);
    await dispatch(switchWallet(wallet));
    setOpenVerification(false);
    setLoading(false);
    await dispatch(setActionWalletId(''));
  };

  const handleSubmit = useCallback(
    async (values) => {
      if (user.userId && email) {
        await dispatch(
          updateUserThunk({
            userId: user.userId,
            userData: { email: values?.email },
          })
        );
        closeConnectedModal();
      } else if (user.userId && phone) {
        await dispatch(
          updateUserThunk({
            userId: user.userId,
            userData: { phone: values?.phone.slice(values.countryCode.length), countryCode: `+${values?.countryCode}` },
          })
        );
        closeConnectedModal();
      }
      setLoading(false);
      closeConnectedModal();
    },
    [email, phone, updatedUserData]
  );

  const handleInfoModal = (e: any) => {
    setShowInfoSeedModal(true);
    e.stopPropagation();
  };

  // Don't remove this once the backend is done we will add this modal

  // const handleClickAddWallet = () => {
  //   setOpenModal(true);
  // };

  // const handleCreateWallet = useCallback(() => {
  //   setOpenVerification(false);
  //   if (error) {
  //     setMessage('Created wallet failed');
  //   } else if (!isLoading && !error) {
  //     setMessage('New Wallet Added Successfully');
  //   }
  // }, [isLoading, error]);

  // const handleOnSubmit = ({ email, phone }: ICreateWalletServiceRequestProps) => {
  //   const walletId = `${email?.split('@')[0]}.near`;
  //   dispatch(setWalletDraft({ phone, walletId }));
  //   handleCreateWallet();
  // };

  if (showSuccessSeedModal) {
    return (
      <CommonDialog open={true} onClose={() => setShowSuccessSeedModal(false)}>
        <SeedPhraseSuccess onClose={setShowSuccessSeedModal} />
      </CommonDialog>
    );
  }

  if (showErrorSeedModal) {
    return (
      <CommonDialog open={true} onClose={() => setShowErrorSeedModal(false)}>
        <SeedPhraseError onClose={setShowErrorSeedModal} message={message} />
      </CommonDialog>
    );
  }

  if (showInfoSeedModal) {
    return (
      <CommonDialog open={true} onClose={() => setShowInfoSeedModal(false)}>
        <SeedPhraseInfo onClose={setShowInfoSeedModal} />
      </CommonDialog>
    );
  }

  const handleDeleteFormSubmit = () => {
    setDeletingUser(true);
    setShowDeleteModal(false);
    setOpenVerification(true);
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    await dispatch(verifyDeleteThunk());

    setLoading(false);
  };

  const handleSuccessDelete = () => {
    setShowDeleteModal(false);
    dispatch(resetUser());
    router.replace('/');
  };

  return (
    <>
      {showDeleteModal && (
        <CommonDialog title="Delete Account" open={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteAccount onFormSubmission={handleDeleteFormSubmit} />
        </CommonDialog>
      )}
      {showSuccessDeleteModal && (
        <CommonDialog title="Delete Account" open={true} onClose={handleSuccessDelete}>
          <DeleteAccountSuccess onClose={signOut} />
        </CommonDialog>
      )}
      <Header title="Settings" isBackButton left></Header>
      {loading && <FullscreenLoader />}
      <SnackBar
        type={SnackBarType.ERROR}
        visible={snackBarVisible}
        setVisible={setSnackBarVisible}
        content={snackBarMessage}
      />
      <DivContainer>
        {showMessage && (
          <SnackBar
            setVisible={setShowMessage}
            visible={showMessage}
            content={message}
            type={!isError ? SnackBarType.SUCCESS : SnackBarType.ERROR}
          />
        )}
        <DivRow>
          <DivConnectedWallet>Connected Wallet</DivConnectedWallet>
          {/*Don't remove this once the backend is done we will add this modal */}
          {/* <AddWalletForm openModal={openModal} setOpenModal={setOpenModal} onSubmit={handleOnSubmit} />
          <DivAllWallet onClick={handleClickAddWallet}>+ Add wallets</DivAllWallet> */}
        </DivRow>
        {/*<DivBox onClick={() => openConnectedModal({ type: 'wallet' })}>*/}
        <DivBox style={{ cursor: 'unset' }}>
          <DivFlexRow>
            <div className="walletId-conatiner">
              <WalletIcon />
              <DivContentBold>{user?.walletName ?? user?.walletId}</DivContentBold>
            </div>
            {/*<RightMenueIcon />*/}
          </DivFlexRow>
        </DivBox>
        <DivConnectedWallet>Profile Settings</DivConnectedWallet>
        <DivBox>
          <DivRow onClick={() => openConnectedModal({ type: 'name' })}>
            <Div>
              <DivLabel>Name</DivLabel>
              <DivContent>{user?.fullName}</DivContent>
            </Div>
            <DivColumn>
              <RightMenueIcon />
            </DivColumn>
          </DivRow>
          <DivRow onClick={() => openConnectedModal({ type: 'email' })}>
            <Div>
              <DivLabel>Email Address</DivLabel>
              <DivContent>{user?.email}</DivContent>
            </Div>
            <DivColumn>
              <RightMenueIcon />
            </DivColumn>
          </DivRow>
          <DivRow onClick={() => openConnectedModal({ type: 'phone' })}>
            <Div>
              <DivLabel>Phone Number</DivLabel>
              <DivContent>{user?.phone && `${user?.countryCode} ${user?.phone}`}</DivContent>
            </Div>
            <DivColumn>
              <RightMenueIcon />
            </DivColumn>
          </DivRow>
        </DivBox>
        <DivBox onClick={openSeedModal}>
          <DivRow>
            <DivContentBold>
              Request Seed Phrase for {user?.walletName}
              <SpanInfoIcon onClick={(e) => handleInfoModal(e)}>
                <InfoIcon />
                <SpanIconInside>
                  <InfoIconInside />
                </SpanIconInside>
              </SpanInfoIcon>
            </DivContentBold>
            <DivColumn>
              <SignOutArrow />
            </DivColumn>
          </DivRow>
        </DivBox>
        <DivBox onClick={() => setShowDeleteModal(true)}>
          <DivRow>
            <DivContentBold>Delete NEARApps Account</DivContentBold>
            <DivColumn>
              <SignOutArrow />
            </DivColumn>
          </DivRow>
        </DivBox>
        <DivBox onClick={signOut}>
          <DivRow>
            <DivContentBold>Sign out</DivContentBold>
            <DivColumn>
              <SignOutArrow />
            </DivColumn>
          </DivRow>
        </DivBox>
        <DivModalContainer>
          <Modal open={connectedModal} onClose={closeConnectedModal}>
            <>
              {wallet && (
                <Box sx={style}>
                  <div>
                    <DivTitleContainer>
                      <span id="modal-modal-title">Select connected wallet</span>
                      <DivCancelIcon onClick={closeConnectedModal}>
                        <CancelIcon style={{ color: '#818C99' }} />
                      </DivCancelIcon>
                    </DivTitleContainer>
                    {allWallet.map((item) => (
                      <div key={`wallet-${item.walletId}`}>
                        <DivSecondContainer key={item.walletId}>
                          <span>{item.walletId}</span>
                          {user.walletId === item.walletId ? (
                            <DivCheckBoxIconContainer>
                              <CheckIcon style={{ color: '#fff' }} />
                            </DivCheckBoxIconContainer>
                          ) : (
                            <DivRoundIconContainer onClick={() => handleSelectWallet(item.walletId)} />
                          )}
                        </DivSecondContainer>
                        {allWallet.length - 1 !== allWallet.indexOf(item) && <DividerStyled />}
                      </div>
                    ))}
                  </div>
                </Box>
              )}
              <Formik
                initialValues={{
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: `${user.countryCode}${user.phone}`,
                }}
                enableReinitialize
                onSubmit={handleFormSubmit}
              >
                {({ errors, touched, values, setFieldValue, initialValues }) => (
                  <Form>
                    {name && (
                      <Box sx={style}>
                        <div>
                          <DivTitleContainer>
                            <span id="modal-modal-title">Change Name</span>
                            <DivCancelIcon onClick={closeConnectedModal}>
                              <CancelIcon style={{ color: '#818C99' }} sx={{ fontSize: 28 }} />
                            </DivCancelIcon>
                          </DivTitleContainer>
                          <DivSecondContainer>
                            <Field
                              as={Input}
                              id="firstName"
                              variant="outlined"
                              name="firstName"
                              data-testid="name-input"
                              placeholder="first name"
                              // error={errors.firstName && touched.email ? true : false}
                            />
                            <Field
                              as={Input}
                              id="lastName"
                              variant="outlined"
                              name="lastName"
                              data-testid="name-input"
                              placeholder="last name"
                              // error={errors.lastName && touched.email ? true : false}
                            />
                          </DivSecondContainer>
                          <DivAddButton>
                            <Button
                              className={className}
                              type="submit"
                              // disabled={!values.firstName || loading || initialValues.firstName === values.firstName}
                            >
                              {loading ? (
                                <Loader
                                  style={{
                                    height: 20,
                                    width: 20,
                                    color: COLORS.WHITE_100,
                                  }}
                                />
                              ) : (
                                'Save'
                              )}
                            </Button>
                          </DivAddButton>
                        </div>
                      </Box>
                    )}
                    {email && (
                      <Box sx={style}>
                        <div>
                          <DivTitleContainer>
                            <span id="modal-modal-title">Update E-mail Address</span>
                            <DivCancelIcon onClick={closeConnectedModal}>
                              <CancelIcon style={{ color: '#818C99' }} />
                            </DivCancelIcon>
                          </DivTitleContainer>
                          <DivSecondContainer>
                            <Field
                              as={Input}
                              id="email"
                              variant="outlined"
                              name="email"
                              error={errors.email && touched.email ? true : false}
                            />
                          </DivSecondContainer>
                          <DivAddButton>
                            <Button
                              className={className}
                              type="submit"
                              disabled={!values.email || loading || initialValues.email === values.email}
                            >
                              Save
                            </Button>
                          </DivAddButton>
                        </div>
                      </Box>
                    )}

                    {phone && (
                      <Box sx={style}>
                        <div>
                          <DivTitleContainer>
                            <span id="modal-modal-title">Change Phone Number</span>
                            <DivCancelIcon onClick={closeConnectedModal}>
                              <CancelIcon style={{ color: '#818C99' }} />
                            </DivCancelIcon>
                          </DivTitleContainer>
                          <DivSecondContainer data-testid="phone-input">
                            <Field
                              as={PhoneInput}
                              id="phone"
                              variant="outlined"
                              prefix={'+'}
                              name="phone"
                              error={errors.phone && touched.phone ? true : false}
                              onChange={(e: any, f: any) => {
                                setFieldValue('phone', e);
                                setFieldValue('countryCode', f.dialCode);
                              }}
                            />
                          </DivSecondContainer>
                          {/* <DivSecondContainer data-testid="phone-input">
                            <DivPhoneInput>
                              <InputCountryCode
                                name="countryCode"
                                maxLength={4}
                                onChange={(e: any) => setFieldValue('countryCode', e.target.value)}
                                error={errors.countryCode && touched.countryCode}
                                placeholder={'+1'}
                              />
                              <InputPhoneNumber
                                name="phone"
                                maxLength={15}
                                onChange={(e: any) => setFieldValue('phone', e.target.value)}
                                error={errors.phone && touched.phone}
                                placeholder={'Ex. 3373788383'}
                              />
                            </DivPhoneInput>
                          </DivSecondContainer> */}
                          <DivAddButton>
                            <Button
                              className={className}
                              type="submit"
                              disabled={!values.phone || loading || initialValues.phone === values.phone}
                            >
                              Save
                            </Button>
                          </DivAddButton>
                        </div>
                      </Box>
                    )}
                  </Form>
                )}
              </Formik>
            </>
          </Modal>
        </DivModalContainer>
        {openVerification && !loading && (
          <CommonDialog open={openVerification} onClose={closeConnectedModal} title="">
            <Grid container>
              <Grid item md={12} sm={12} xs={12}>
                <DivDoubleArrowWrapper>
                  <DoubleArrow />
                </DivDoubleArrowWrapper>
                <DivAuthHeading data-testid="verification-heading">Authentication</DivAuthHeading>
              </Grid>
            </Grid>
            <DivFormWrapper className="form-wrapper">
              <p>We've sent a 6-digit verification code to your {email ? 'email' : 'phone'}</p>
              <p className="sub-heading">{email ? user.email : user.phone}</p>
              <VerificationForm
                setLoading={setLoading}
                loading={loading}
                onSubmit={wallet ? handleSwitchWallet : deletingUser ? handleDeleteUser : handleSubmit}
              />
            </DivFormWrapper>
          </CommonDialog>
        )}
      </DivContainer>
    </>
  );
};

export default Settings;
