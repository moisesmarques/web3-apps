import styled from '@emotion/styled';
import { Typography } from '@mui/material';

import { COLORS } from '@/constants/colors';

export const DivAccordionStyled = styled.div`
  & .MuiAccordion-root {
    border-radius: 10px;
    box-shadow: none;
    padding: 0rem 1rem;
    border: 1px solid ${COLORS.BORDER_COLOR};
  }

  & .MuiAccordionSummary-root {
    padding: 0;
  }

  & .MuiAccordionDetails-root {
    padding: 0;
    padding-bottom: 1rem;
  }
`;

export const StyledTypography = styled(Typography)`
  font-weight: 600;
  font-size: 14px;
  color: ${COLORS.BLACK_100};
`;
