import { useRouter } from 'next/router';

import { Fragment, useState, useEffect } from 'react';

import { Grid } from '@mui/material';

import { ArrowRightWhite } from '@/assets/svg/arrow-right-white';
import { CloseButton } from '@/assets/svg/CloseButton';
import { UserImage } from '@/assets/svg/user-image';
import CustomAccordion from '@/components/Accordion';
import { DivButtonWrapper } from '@/components/core/CommonDialog/CommonDialog.styles';
import FullscreenLoader from '@/components/FullscreenLoader';
import { COLORS } from '@/constants/colors';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { NFTDetailsPreview } from '@/modules/NFTDetails';
import SelectContact from '@/modules/SelectContact';
import SendNFTSuccess from '@/modules/SendNFTSuccess/SendNFTSuccess';
import { resetSelectedContacts } from '@/store/contacts';
import { openAndCloseContactDialog, setSelectedNft } from '@/store/dialogs';
import { getDialogsStatus } from '@/store/dialogs/dialogsSelector';
import { closeCreateNftDialog } from '@/store/dialogs/dialogsSlice';
import { getNftSelector, nftDetailsThunk, resetStep } from '@/store/nft';
import { homePage } from '@/utils/router.utils';

import {
  AttributeName,
  AttributeValue,
  ButtonSend,
  CreatorName,
  CreatorTitle,
  DivAccordionContainer,
  DivAttributeContainer,
  DivCloseButtonContainer,
  DivDetailsContainer,
  DivInfo,
  DivNftCreator,
  DivNftCreatorContainer,
  DivNftCreatorDetails,
  DivNftInfoContainer,
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
const NftDetail = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [prefetchImage, setPrefetchImage] = useState<string | undefined | null>();
  const { data, status, sendNftSuccess: sendNftSuccessId } = useAppSelector(getNftSelector);
  const { isSelectContactOpen } = useAppSelector(getDialogsStatus);
  const { nftId }: { nftId?: string } = router.query;

  useEffect(() => {
    if (nftId) {
      dispatch(nftDetailsThunk(nftId));
    }
  }, [nftId]);

  const onSendNft = async () => {
    dispatch(resetStep());
    dispatch(setSelectedNft({ nftId, move: true }));
    dispatch(openAndCloseContactDialog(true));
    dispatch(resetSelectedContacts());
  };

  const onClose = async () => {
    await dispatch(resetStep());
    dispatch(closeCreateNftDialog());
    router.push(homePage());
  };

  const getImagesFromUrl = async (url: string | undefined | any) => {
    const response = await fetch(url);
    const imageBlob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(imageBlob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setPrefetchImage(base64data);
    };
  };

  useEffect(() => {
    getImagesFromUrl(data.fileUrl);
  }, []);

  return (
    <Fragment>
      {isSelectContactOpen && <SelectContact />}
      {sendNftSuccessId && <SendNFTSuccess prefetchImage={prefetchImage} />}
      <NftDetailsLayoutContainer data-testid="auth-layout-container">
        <Grid container className="container">
          <Grid item md={6} sm={12} xs={12} className="left-section">
            <NFTDetailsPreview />
          </Grid>
          <Grid item md={6} sm={12} xs={12} className="right-section">
            {status === 'loading' && data?.nftId !== nftId ? (
              <FullscreenLoader />
            ) : (
              <DivDetailsContainer isMobile={isMobile}>
                <DivCloseButtonContainer>
                  <span />
                  <DivButtonWrapper onClick={onClose} data-testid="close-button" style={{ top: '10px', right: '10px' }}>
                    <CloseButton />
                  </DivButtonWrapper>
                </DivCloseButtonContainer>
                <DivNftInfoContainer>
                  <NftCategory>Digital Art</NftCategory>
                  <NftTitle>{data?.title}</NftTitle>
                  <NftNumber>#{data.nftId}</NftNumber>
                </DivNftInfoContainer>
                <DivNftCreator>
                  <DivNftCreatorContainer>
                    <UserImage />
                    <DivNftCreatorDetails>
                      <CreatorTitle>Creator</CreatorTitle>
                      <CreatorName>{data?.ownerWalletId}</CreatorName>
                    </DivNftCreatorDetails>
                  </DivNftCreatorContainer>
                  <ButtonSend
                    onClick={onSendNft}
                    backgroundColor={COLORS.THEME_BUTTON}
                    hoverColor={COLORS.THEME_BUTTON}
                  >
                    Send <ArrowRightWhite />
                  </ButtonSend>
                </DivNftCreator>
                <DivAccordionContainer>
                  {data?.description && (
                    <CustomAccordion title="Description" open>
                      <Paragraph>{data?.description}</Paragraph>
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

                  {data?.attributes?.length ? (
                    <CustomAccordion title="Properties">
                      {data?.attributes?.map((attr) => (
                        <DivAttributeContainer key={attr?.attributeName + attr?.attributeValue}>
                          <AttributeName>{attr?.attributeName}</AttributeName>
                          <AttributeValue>{attr?.attributeValue}</AttributeValue>
                        </DivAttributeContainer>
                      ))}
                    </CustomAccordion>
                  ) : null}
                </DivAccordionContainer>
              </DivDetailsContainer>
            )}
          </Grid>
        </Grid>
      </NftDetailsLayoutContainer>
    </Fragment>
  );
};

export default NftDetail;
