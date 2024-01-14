import styled from '@emotion/styled';
import Select from '@mui/material/Select';

import { COLORS } from '@/constants/colors';

export const StyledSelect = styled(Select)<{ isMobile?: boolean }>`
  border-radius: 10px;
  background-color: ${COLORS.GREY_2};
  min-width: ${({ isMobile }) => (isMobile ? '100%' : 'calc(50% - 0.5rem)')};
  margin-block-start: 10px;

  .MuiListItemText-root {
    margin-top: 0;
    margin-bottom: 0;
  }
`;
