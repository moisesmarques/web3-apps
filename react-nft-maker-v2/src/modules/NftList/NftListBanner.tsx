import { useDispatch } from 'react-redux';

import { ArrowRight } from '@/assets/svg/arrow-right';
import { CreateNftLeftImage } from '@/assets/svg/create-nft-left-image';
import { CreateNftRightImage } from '@/assets/svg/create-nft-right-image';
import { MobileBannerBg } from '@/assets/svg/mobile-banner-bg';
import { COLORS } from '@/constants/colors';
import { useIsMobile } from '@/hooks/useIsMobile';
import { changeStep, createNewNFT, setFromScreen } from '@/store/nft/nftSlice';

import {
  ButtonContainer,
  DivBannerWrapper,
  DivLeftImageWrapper,
  DivRightImageWrapper,
  DivTitleWrapper,
} from './NftListBanner.styles';

/**
 *
 * @returns NftList Banner
 */
const NftListBanner = (): JSX.Element => {
  const isMobile = useIsMobile();
  const dispatch = useDispatch();

  const handleCreateNft = () => {
    dispatch(createNewNFT());
    dispatch(changeStep('create'));
    dispatch(setFromScreen('main'));
  };

  return (
    <DivBannerWrapper isMobile={isMobile}>
      <DivTitleWrapper isMobile={isMobile}>
        Start Creating your <strong>NFTs</strong> Today
      </DivTitleWrapper>
      <ButtonContainer
        isMobile={isMobile}
        onClick={handleCreateNft}
        backgroundColor={COLORS.THEME_BUTTON}
        hoverColor={COLORS.THEME_BUTTON}
      >
        Mint an NFT <ArrowRight />
      </ButtonContainer>
      <DivLeftImageWrapper isMobile={isMobile}>
        {isMobile ? <MobileBannerBg /> : <CreateNftLeftImage />}
      </DivLeftImageWrapper>
      {!isMobile && (
        <DivRightImageWrapper>
          <CreateNftRightImage />
        </DivRightImageWrapper>
      )}
    </DivBannerWrapper>
  );
};

export default NftListBanner;
