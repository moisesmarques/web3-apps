import React, { useCallback } from 'react';

import { Field } from 'formik';

import { CloseButton } from '@/assets/svg/CloseButton';
import Input from '@/components/core/FieldInput/FieldInput';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getCreateNFTAttributesDataByIdSelector } from '@/store/nft/nftSelector';
import { removeAttribute, setAttributeData } from '@/store/nft/nftSlice';

import { DivAttributeContainer, DivRemoveContainer } from './Attribute.styles';

interface IProps {
  id: string;
  canRemove?: boolean;
}

export const Attribute = ({ id, canRemove }: IProps) => {
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();
  const attribute = useAppSelector((state) => getCreateNFTAttributesDataByIdSelector(state, id));
  const handleChange = useCallback(
    (field: 'attributeName' | 'attributeValue', value: string) => {
      dispatch(setAttributeData({ id, field, value }));
    },
    [id]
  );

  const handleRemove = useCallback(() => {
    dispatch(removeAttribute(id));
  }, [id]);

  return (
    <DivAttributeContainer isMobile={isMobile}>
      <Field
        as={Input}
        name="attributeName"
        value={attribute?.attributeName}
        onChange={(e: any) => handleChange('attributeName', e.target.value)}
        className="input"
        placeholder="Ex. Size"
      />
      <Field
        as={Input}
        name="attributeValue"
        value={attribute?.attributeValue}
        onChange={(e: any) => handleChange('attributeValue', e.target.value)}
        className="input"
        placeholder="Ex. 40"
      />
      {canRemove && (
        <DivRemoveContainer onClick={handleRemove}>
          <CloseButton />
        </DivRemoveContainer>
      )}
    </DivAttributeContainer>
  );
};
