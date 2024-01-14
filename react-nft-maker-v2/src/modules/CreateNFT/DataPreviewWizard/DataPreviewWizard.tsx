import { useSelector } from 'react-redux';

import { ArrowRight } from '@/assets/svg/arrow-right';
import { UserImage } from '@/assets/svg/user-image';
import MediaItem from '@/components/MediaItem';
import { COLORS } from '@/constants/colors';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getAuthUserSelector } from '@/store/auth/authSelector';
import { getNftSelector, selectedFileSelector } from '@/store/nft/nftSelector';

import {
  ButtonCreate,
  DivButton,
  DivCategoryTag,
  DivContentContainer,
  DivCreatorInfo,
  DivCreatorInfoContainer,
  DivCreatorName,
  DivCreatorTitle,
  DivDescription,
  DivImagePreviewContainer,
  DivPreviewContainer,
  DivPreviewDetails,
  DivTitle,
  ParagraphPreviewTitle,
} from './DataPreviewWizard.styles';

type IProps = {
  setProgress?: (progress: number) => void;
  handleNext: () => void;
};

const DataPreviewWizard = (props: IProps) => {
  const isMobile = useIsMobile();
  const { handleNext } = props;
  const selectedFile = useSelector(selectedFileSelector);
  const createNFTData = useSelector(getNftSelector);
  const loggedInUser = useSelector(getAuthUserSelector);

  return (
    <DivContentContainer>
      <ParagraphPreviewTitle>Preview</ParagraphPreviewTitle>
      {selectedFile && (
        <DivPreviewContainer isMobile={isMobile}>
          <DivImagePreviewContainer>
            <DivCategoryTag>{createNFTData?.data?.category}</DivCategoryTag>
            <MediaItem file={selectedFile} />
          </DivImagePreviewContainer>
          <DivPreviewDetails>
            <DivTitle>{createNFTData?.data?.title}</DivTitle>
            <DivDescription>{createNFTData?.data?.description}</DivDescription>
            <DivCreatorInfoContainer>
              <UserImage />
              <DivCreatorInfo>
                <DivCreatorTitle>Creator</DivCreatorTitle>
                <DivCreatorName>{loggedInUser.walletName}</DivCreatorName>
              </DivCreatorInfo>
            </DivCreatorInfoContainer>
          </DivPreviewDetails>
        </DivPreviewContainer>
      )}
      <DivButton>
        <ButtonCreate onClick={handleNext} backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
          Mint NFT <ArrowRight />
        </ButtonCreate>
      </DivButton>
    </DivContentContainer>
  );
};

export default DataPreviewWizard;
