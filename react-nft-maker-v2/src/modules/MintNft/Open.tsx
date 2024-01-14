import React, { FC } from 'react';

import UpRightArrow from '@/assets/svg/up-right-arrow';
import Button from '@/components/core/Button';
import Input from '@/components/core/FieldInput';
import Label from '@/components/core/Label';
import { COLORS } from '@/constants/colors';

import { NFTData, StepProps } from './MintNft';
import {
  DivContainer,
  DivNftImageContainer,
  ImgNft,
  DivContentContainer,
  DivTagsContainer,
  Tag,
  DivCreatorContainer,
  ImgCreator,
  DivCreatorDetailsContainer,
  TextCreator,
  TextCreatorName,
  DivInputContainer,
  DivButtonContainer,
} from './Open.styles';

const Open: FC<StepProps> = () => {
  return (
    <DivContainer data-test-id="openNftCreate">
      <DivNftImageContainer>
        <ImgNft src={NFTData.fileUrl} />
      </DivNftImageContainer>
      <DivContentContainer>
        <DivTagsContainer>
          {NFTData.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </DivTagsContainer>
        <DivCreatorContainer>
          <ImgCreator src={`/images/placeholder/creator.png`} />
          <DivCreatorDetailsContainer>
            <TextCreator>Creator</TextCreator>
            <TextCreatorName>{NFTData.creator.name}</TextCreatorName>
          </DivCreatorDetailsContainer>
        </DivCreatorContainer>
        <DivInputContainer>
          <Label htmlFor="accountId" className="label">
            Description
          </Label>
          <Input id="fullName" name="fullName" placeholder="Placeholder" className="input" />
        </DivInputContainer>
        <DivInputContainer>
          <Label htmlFor="accountId" className="label">
            Properties
          </Label>
          <Input id="fullName" name="fullName" placeholder="Placeholder" className="input" />
        </DivInputContainer>

        <DivButtonContainer>
          <Button backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON} disabled>
            Cancel
          </Button>
          <Button backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
            Send Nft <UpRightArrow />
          </Button>
        </DivButtonContainer>
      </DivContentContainer>
    </DivContainer>
  );
};

export default Open;
