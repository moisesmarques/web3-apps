import React, { FC } from 'react';

import { ArrowRight } from '@/assets/svg/arrow-right';
import Button from '@/components/core/Button';
import { COLORS } from '@/constants/colors';

import { NFTData, StepProps } from './MintNft';
import {
  DivContianer,
  TextTitle,
  DivNftCardStyled,
  DivImagePlaceHolder,
  DivLabel,
  ImgNtf,
  DivCardContent,
  CardTitle,
  CardSubtitle,
  DivCreatorContainer,
  ImgCreator,
  DivCreatorDetailsContainer,
  TextCreator,
  TextCreatorName,
  DivMintButtonContainer,
} from './Preview.styles';

const Preview: FC<StepProps> = ({ changeStep, setModalState }) => {
  const handleCreateNft = () => {
    changeStep('success');
    setModalState({
      title: NFTData.title,
      maxWidth: 'xs',
      alignTitle: 'left',
    });
  };
  return (
    <DivContianer data-testid="previewNftCreate">
      <TextTitle>Preview</TextTitle>

      <DivNftCardStyled>
        <DivImagePlaceHolder>
          <DivLabel>{NFTData.category}</DivLabel>
          <ImgNtf src={NFTData.fileUrl} />
        </DivImagePlaceHolder>
        <DivCardContent>
          <CardTitle>{NFTData.title}</CardTitle>
          <CardSubtitle>{`${NFTData.id}`}</CardSubtitle>
          <DivCreatorContainer>
            <ImgCreator src={`/images/placeholder/creator.png`} />
            <DivCreatorDetailsContainer>
              <TextCreator>Creator</TextCreator>
              <TextCreatorName>{NFTData.creator.name}</TextCreatorName>
            </DivCreatorDetailsContainer>
          </DivCreatorContainer>
        </DivCardContent>
      </DivNftCardStyled>
      <DivMintButtonContainer>
        <Button onClick={handleCreateNft} backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
          Create an Nft <ArrowRight />
        </Button>
      </DivMintButtonContainer>
    </DivContianer>
  );
};

export default Preview;
