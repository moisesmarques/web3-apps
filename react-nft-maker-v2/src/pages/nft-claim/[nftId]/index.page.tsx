import { useRouter } from 'next/router';

import { useEffect, useState } from 'react';

import { Grid, Modal } from '@mui/material';

import { ArrowRight } from '@/assets/svg/arrow-right';
import { CloseButton } from '@/assets/svg/CloseButton';
import { UserImage } from '@/assets/svg/user-image';
import CustomAccordion from '@/components/Accordion';
import { DivButtonWrapper } from '@/components/core/CommonDialog/CommonDialog.styles';
import FullscreenLoader from '@/components/FullscreenLoader';
import { COLORS } from '@/constants/colors';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { NFTDetailsPreview } from '@/modules/NFTDetails';
import { getAuthDataSelector } from '@/store/auth';
import { setReturnUrl } from '@/store/common/commonSlice';
import { getNftSelector, nftDetailsThunk } from '@/store/nft';
import { claimNftThunk } from '@/store/nft/nftSlice';

import {
  AttributeName,
  AttributeValue,
  ButtonClaim,
  ButtonModal,
  CreatorName,
  CreatorTitle,
  DivAccordionContainer,
  DivAttributeContainer,
  DivButtonContainer,
  DivCloseButtonContainer,
  DivDetailsContainer,
  DivInfo,
  DivModalContentBottom,
  DivModalContentContainer,
  DivModalContentTop,
  DivModalInnerWrapper,
  DivNftCreator,
  DivNftCreatorContainer,
  DivNftCreatorDetails,
  DivNftInfoContainer,
  DivTitle,
  NftCategory,
  NftDetailsLayoutContainer,
  NftNumber,
  NftTitle,
  Paragraph,
} from './index.styles';

/**
 *
 * @returns NFT Details Page
 */
const ClaimNFT = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { data, status } = useAppSelector(getNftSelector);
  const { token } = useAppSelector(getAuthDataSelector);
  const { nftId }: { nftId?: string } = router.query;

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (nftId) {
      dispatch(nftDetailsThunk(nftId));
    }
  }, [nftId]);

  const onClose = () => {
    if (token) {
      dispatch(claimNftThunk({ nftId, claimToken: data?.claimToken })); // Needs to handle proper claimToken after send nft API has been fixed
    } else {
      setShowModal(true);
    }
  };

  const closeModal = () => setShowModal(false);

  const onLoginWithNearClick = () => {
    router.push({
      pathname: '/login',
      query: {
        returnUrl: `/nft-claim/${nftId}`,
      },
    });
    dispatch(setReturnUrl(`/nft-claim/${nftId}`));
  };

  const onCreateNewWalletClick = () => {
    router.push({
      pathname: '/signup',
      query: {
        returnUrl: `/nft-claim/${nftId}`,
      },
    });
    dispatch(setReturnUrl(`/nft-claim/${nftId}`));
  };

  return (
    <NftDetailsLayoutContainer data-testid="auth-layout-container">
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <DivModalInnerWrapper>
          <DivModalContentContainer>
            <DivModalContentTop>
              <DivTitle>Claim NFT</DivTitle>
              <span onClick={closeModal} style={{ cursor: 'pointer' }}>
                <CloseButton />
              </span>
            </DivModalContentTop>
            <DivModalContentBottom>
              <ButtonModal onClick={onCreateNewWalletClick}>
                Create new Wallet <ArrowRight />
              </ButtonModal>
              <ButtonModal
                onClick={onLoginWithNearClick}
                backgroundColor={COLORS.THEME_BUTTON}
                hoverColor={COLORS.THEME_BUTTON}
              >
                Login with NEARApps ID <ArrowRight />
              </ButtonModal>
            </DivModalContentBottom>
          </DivModalContentContainer>
        </DivModalInnerWrapper>
      </Modal>

      <Grid
        container
        className="container"
        style={{
          overflowY: 'scroll',
          minHeight: '100%',
        }}
      >
        <Grid item md={6} sm={12} xs={12} className="left-section">
          <NFTDetailsPreview />
        </Grid>
        <Grid item md={6} sm={12} xs={12} className="right-section">
          {status === 'loading' && data.nftId !== nftId ? (
            <FullscreenLoader />
          ) : (
            <DivDetailsContainer isMobile={isMobile}>
              <DivNftInfoContainer>
                <NftCategory isMobile={isMobile}>{data.category}</NftCategory>
                <NftTitle>{data.title}</NftTitle>
                <NftNumber>#63738</NftNumber>
              </DivNftInfoContainer>
              <DivNftCreator>
                <DivNftCreatorContainer>
                  <UserImage />
                  <DivNftCreatorDetails>
                    <CreatorTitle>Creator</CreatorTitle>
                    <CreatorName>{data?.owner?.userId}</CreatorName>
                  </DivNftCreatorDetails>
                </DivNftCreatorContainer>
              </DivNftCreator>
              <DivButtonContainer>
                <ButtonClaim onClick={onClose} backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
                  Claim
                </ButtonClaim>
              </DivButtonContainer>
              <DivAccordionContainer>
                {data?.description && (
                  <CustomAccordion title="Description" open>
                    <Paragraph>{data.description}</Paragraph>
                  </CustomAccordion>
                )}

                {(data?.token_id || data?.explorer_url) && (
                  <CustomAccordion title="NFT Info" open>
                    <DivInfo>
                      <p>Token ID</p>
                      <a href="https://explorer.near.org/" target="_blank" rel="noreferrer">
                        {data?.token_id ?? ''}
                      </a>
                    </DivInfo>
                    <DivInfo>
                      <p>Contract Address</p>
                      <a href={data?.explorer_url} target="_blank" rel="noreferrer">
                        Explorer
                      </a>
                    </DivInfo>
                  </CustomAccordion>
                )}

                {data.attributes?.length && (
                  <>
                    <CustomAccordion title="Description">
                      {data?.attributes?.map((attr) => (
                        <DivAttributeContainer key={attr?.attributeName + attr?.attributeValue}>
                          <AttributeName>{attr?.attributeName}</AttributeName>
                          <AttributeValue>{attr?.attributeValue}</AttributeValue>
                        </DivAttributeContainer>
                      ))}
                    </CustomAccordion>
                    <CustomAccordion title="NFT Info">
                      {data?.attributes?.map((attr) => (
                        <DivAttributeContainer key={attr?.attributeName + attr?.attributeValue}>
                          <AttributeName>{attr?.attributeName}</AttributeName>
                          <AttributeValue>{attr?.attributeValue}</AttributeValue>
                        </DivAttributeContainer>
                      ))}
                    </CustomAccordion>
                  </>
                )}
              </DivAccordionContainer>
            </DivDetailsContainer>
          )}
          <DivCloseButtonContainer>
            <span />
            <DivButtonWrapper onClick={onClose} data-testid="close-button" style={{ top: '10px', right: '10px' }}>
              <CloseButton />
            </DivButtonWrapper>
          </DivCloseButtonContainer>
        </Grid>
      </Grid>
    </NftDetailsLayoutContainer>
  );
};

export default ClaimNFT;
