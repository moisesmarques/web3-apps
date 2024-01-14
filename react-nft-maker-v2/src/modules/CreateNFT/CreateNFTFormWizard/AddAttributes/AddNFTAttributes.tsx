import React, { useCallback } from 'react';

import Label from '@/components/core/Label';
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { TextButton } from '@/modules/CreateNFT/CreateNFT.styles';
import { DivAttributesWrapper } from '@/modules/CreateNFT/CreateNFTFormWizard/AddAttributes/Attribute.styles';
import { getCreateNFTAttributesIdSelector } from '@/store/nft/nftSelector';
import { addAttribute } from '@/store/nft/nftSlice';

import { Attribute } from './Attribute';

const AddNFTAttributes = () => {
  const dispatch = useAppDispatch();
  const attributes = useAppSelector(getCreateNFTAttributesIdSelector);

  const handleAddAttribute = useCallback(() => {
    dispatch(addAttribute());
  }, []);

  return (
    <>
      <Label className="label">PROPERTIES</Label>

      <DivAttributesWrapper>
        {attributes?.map((attribute, index) => (
          <Attribute id={attribute} key={attribute} canRemove={index > 0} />
        ))}
      </DivAttributesWrapper>
      <TextButton
        className="add-more-attributes"
        type="button"
        onClick={handleAddAttribute}
        backgroundColor={COLORS.WHITE_100}
        hoverColor={COLORS.WHITE_100}
      >
        +Add more
      </TextButton>
    </>
  );
};

export default AddNFTAttributes;
