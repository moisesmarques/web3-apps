import { useEffect } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';

import Label from '@/components/core/Label';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { createNewNFTCategorySelector } from '@/store/nft/nftSelector';
import { setCategory } from '@/store/nft/nftSlice';

import { StyledSelect } from './SelectCategory.styles';

export const SelectCategory = () => {
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCategory('Digital Arts'));
  }, []);

  const category = useAppSelector(createNewNFTCategorySelector);

  const handleCategoryChange = (event: SelectChangeEvent<any>) => {
    dispatch(setCategory(event.target.value));
  };

  return (
    <>
      <Label htmlFor="category" className="label">
        CATEGORY - Digital Arts
      </Label>
      <StyledSelect
        isMobile={isMobile}
        displayEmpty
        id="category"
        value={[category || 'Digital Arts']}
        IconComponent={() => <KeyboardArrowDownIcon />}
        inputProps={{ 'aria-label': 'Without label' }}
        onChange={handleCategoryChange}
      >
        <MenuItem disabled value="">
          SELECT CATEGORY
        </MenuItem>
        <MenuItem value={'Digital Arts'}>
          <ListItemText primary={'Digital Arts'} />
        </MenuItem>
      </StyledSelect>
    </>
  );
};

const StaticSelectCategory = () => (
  <Label htmlFor="category" className="label">
    CATEGORY - Digital Arts
  </Label>
);

export default StaticSelectCategory;
