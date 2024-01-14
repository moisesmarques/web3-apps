import { ArrowRightWhite } from '@/assets/svg/arrow-right-white';
import Accordion from '@/components/Accordion';
import CommonDialog from '@/components/core/CommonDialog';
import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getNftSelector } from '@/store/nft';

import {
  ButtonStyled,
  DivAvatarContainer,
  DivAvatarDetails,
  DivAvatarImage,
  DivAvatarName,
  DivAvatarTitle,
  DivButtonContainer,
  DivDropdownContainer,
  DivDropdownTitle,
  DivSingleNftDetails,
  DivSingleNftDetailsTop,
  DivSingleNftImage,
  DivSingleNftTag,
  DivSingleNftWrapper,
} from './SingleNft.styles';

interface IProps {
  handleClose: () => void;
}

const SingleNft = (props: IProps) => {
  const { handleClose } = props;

  const {
    data: {
      title,
      description,
      category,
      fileUrl,
      owner: { email },
    },
  } = useAppSelector(getNftSelector);

  return (
    <CommonDialog open onClose={handleClose} title={'NFT Details'} alignTitle="left" maxWidth="sm">
      <DivSingleNftWrapper>
        <DivSingleNftImage src={fileUrl} />
        <DivSingleNftDetails>
          <DivSingleNftDetailsTop>
            <DivSingleNftTag>{category}</DivSingleNftTag>
          </DivSingleNftDetailsTop>
          <DivAvatarContainer>
            <DivAvatarImage />
            <DivAvatarDetails>
              <DivAvatarTitle>Creator</DivAvatarTitle>
              <DivAvatarName>{email}</DivAvatarName>
            </DivAvatarDetails>
          </DivAvatarContainer>
          <DivDropdownContainer>
            <DivDropdownTitle>Description</DivDropdownTitle>
            <Accordion title={title}>{description}</Accordion>
          </DivDropdownContainer>
          <DivDropdownContainer>
            <DivDropdownTitle>Properties</DivDropdownTitle>
            <Accordion title={'Properties'}>Test Properties</Accordion>
          </DivDropdownContainer>
          <DivButtonContainer>
            <ButtonStyled backgroundColor="#bdbdbd" onClick={handleClose}>
              Cancel
            </ButtonStyled>
            <ButtonStyled backgroundColor="#2f80ed">
              <span>Send NFT</span>
              <ArrowRightWhite />
            </ButtonStyled>
          </DivButtonContainer>
        </DivSingleNftDetails>
      </DivSingleNftWrapper>
    </CommonDialog>
  );
};

export default SingleNft;
