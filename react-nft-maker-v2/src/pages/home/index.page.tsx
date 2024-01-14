import { useRouter } from 'next/router';

import React, { useEffect } from 'react';

import { ChevronRight } from '@mui/icons-material';
import { Grid, Modal, Box } from '@mui/material';

import { CloseIcon } from '@/assets/svg/close-icon';
import { HomePageImage } from '@/assets/svg/home-page-1';
import { HomePageImage2 } from '@/assets/svg/home-page-2';
import { MobileHamburgerIcon } from '@/assets/svg/mobile-hamburger-icon';
import { PrimeLabAssets } from '@/assets/svg/prime-lab-assets';
import { PrimeLabLogo } from '@/assets/svg/primelab-logo';
import Button from '@/components/core/Button';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getAuthDataSelector, verifyJwtThunk } from '@/store/auth';

import {
  LeftSideContainer,
  DivHomeLogo,
  LeftTopSection,
  DivHomeLogoTwo,
  LeftBottomSection,
  RightSideContainer,
  RightTopSection,
  Button1,
  Button2,
  RightSecondSection,
  RightThirdSection,
  DivCardBodyOne,
  DivCardBodyTwo,
  DivCardBodyTwoTop,
  GetStatedButtonContainer,
  LegalTermsContainer,
  Privacy,
  Terms,
  DivCopyRight,
  Hamburger,
  PopupContainer,
  CloseButtonContainer,
} from './index.styles';
const style = {
  position: 'absolute',
  bottom: '2%',
  left: '50%',
  transform: 'translate(-50%, -2%)',
  width: '90%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '18px',
  p: 4,
};
export default function HomePage() {
  const dispatch = useAppDispatch();

  const { token } = useAppSelector(getAuthDataSelector);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query?.access_token) {
      chromeExtensionLogin(router.query?.access_token);
    }
  }, [router.query]);

  function chromeExtensionLogin(token: any) {
    // set user loggedin from chrome extension
    // decodes user details from token and set to state
    dispatch(verifyJwtThunk({ token: token }));
  }

  const date = new Date();

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleTerms = () => {
    window.open('https://terms.nftmakerapp.io/', '_blank');
  };

  const handlePrivacyPolicy = () => {
    window.open('https://privacy.nftmakerapp.io/', '_blank');
  };

  const handleContactUs = () => {
    window.open('https://primelab.io/', '_blank');
  };

  useEffect(() => {
    if (token) {
      router.push('/all-nfts');
    }
  }, [token]);

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm={12} md={6}>
          <LeftSideContainer>
            <LeftTopSection>
              <DivHomeLogo>
                <PrimeLabAssets />
              </DivHomeLogo>
              <DivHomeLogoTwo>
                <PrimeLabLogo />
              </DivHomeLogoTwo>
            </LeftTopSection>
            <LeftBottomSection>
              <h1>
                The easiest way to create NFTs and share them with others. Start minting NFTs in NEARApp’s rapidly
                expanding ecosystem.
              </h1>
            </LeftBottomSection>
            <Hamburger>
              <button onClick={handleOpen}>
                <MobileHamburgerIcon />
              </button>
            </Hamburger>
          </LeftSideContainer>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <RightSideContainer>
            <RightTopSection>
              <Button1 onClick={handleContactUs}>About Us</Button1>
              <Button2 onClick={handleContactUs}>Contacts Us</Button2>
              <Button onClick={handleLogin} backgroundColor="#32404e">
                Log in <ChevronRight />
              </Button>
            </RightTopSection>
            <RightSecondSection>
              <h1>
                <span>NFT </span>
                Maker App
              </h1>
            </RightSecondSection>
            <RightThirdSection>
              <DivCardBodyOne>
                <DivCardBodyTwoTop>
                  <p>Digital Art</p>
                  <HomePageImage />
                </DivCardBodyTwoTop>
                <div className="contentInfo">
                  <p className="title">Vecotry Illustration</p>
                  <p className="artId">#17372 </p>
                </div>
              </DivCardBodyOne>
              <DivCardBodyTwo>
                <DivCardBodyTwoTop>
                  <p>Digital Art</p>
                  <HomePageImage2 />
                </DivCardBodyTwoTop>
                <p className="title">Nature Illustration</p>
                <p className="artId">#3783 </p>
              </DivCardBodyTwo>
            </RightThirdSection>
            <GetStatedButtonContainer>
              <Button onClick={handleGetStarted} backgroundColor="#2F80ED">
                Create an account <ChevronRight />
              </Button>
            </GetStatedButtonContainer>
            <LegalTermsContainer>
              <Privacy onClick={handlePrivacyPolicy}>Privacy Policy</Privacy>|
              <Terms onClick={handleTerms}>Terms of Service</Terms>
            </LegalTermsContainer>
            <DivCopyRight>© {date.getFullYear()} Prime Lab.</DivCopyRight>
          </RightSideContainer>
        </Grid>
      </Grid>

      <Modal open={open} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <PopupContainer>
            <Button1 onClick={handleContactUs}>About us</Button1>
            <Button2 onClick={handleContactUs}>Contact us</Button2>
            <Button onClick={handleLogin} backgroundColor="#32404e">
              Login <ChevronRight />
            </Button>
            <CloseButtonContainer>
              <button onClick={handleClose}>
                <CloseIcon />
              </button>
            </CloseButtonContainer>
          </PopupContainer>
        </Box>
      </Modal>
    </>
  );
}
