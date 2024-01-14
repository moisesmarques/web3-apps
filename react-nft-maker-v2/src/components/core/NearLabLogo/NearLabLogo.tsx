import { Grid } from '@mui/material';

import { NearLabIcon } from '@/assets/svg/near-lab-Icon';

import { StyledLogo } from './NearLabLogo.style';

const NearLabLogo = () => {
  return (
    <StyledLogo>
      <Grid item md={6} sm={12} xs={12} className="left-sections">
        <NearLabIcon />
      </Grid>
    </StyledLogo>
  );
};

export default NearLabLogo;
