import { Grid } from '@mui/material';

import { PrimeLabLogo } from '@/assets/svg/primelab-logo';

import { StyledLogo } from './PrimeLabLogo.style';

const PrimeLabLeftLogo = () => {
  return (
    <StyledLogo>
      <Grid item md={6} sm={12} xs={12} className="left-sections">
        <PrimeLabLogo />
      </Grid>
    </StyledLogo>
  );
};

export default PrimeLabLeftLogo;
