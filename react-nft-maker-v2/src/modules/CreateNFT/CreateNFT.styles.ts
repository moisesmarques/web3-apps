import styled from '@emotion/styled';

import Button from '@/components/core/Button';
import CommonDialog from '@/components/core/CommonDialog';
import { COLORS } from '@/constants/colors';

export const DialogCreateNFTWorkflow = styled(CommonDialog)<{ isMobile?: boolean }>`
  .MuiPaper-root {
    padding: unset !important;

    margin: ${({ isMobile }) => (isMobile ? 'unset' : 'inherit')};
    width: ${({ isMobile }) => (isMobile ? '100%' : 'calc(100% - 64px)')};
    height: ${({ isMobile }) => (isMobile ? '100%' : 'calc(100% - 64px)')};
    align-self: ${({ isMobile }) => (isMobile ? 'flex-end' : 'unset')};
    border-radius: ${({ isMobile }) => (isMobile ? '14px 14px 0px 0px' : '20px')} !important;
  }

  .MuiDialogContent-root {
    padding-top: 0 !important;
  }
`;

export const DivContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  min-height: 78vh;
  width: 96%;
  align-items: center;
  justify-content: center;
  padding-block-start: 20px;
`;

export const DivProgressContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 6px;
  left: 0;
  right: 0;
  background-color: ${COLORS.BORDER_COLOR};
  overflow: hidden;
  z-index: 2;
`;

export const DivProgress = styled.div<{ progress: number }>`
  width: ${({ progress = 0 }) => `${Math.min(Math.max(progress, 0), 100)}%`};
  height: 6px;
  background-color: ${COLORS.BLUE_100};
  transition: width 500ms;
`;

export const ButtonCreate = styled(Button)`
  width: 130px;
  margin-block-end: 0;
`;
export const DivTabContainer = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => (visible ? 'inherit' : 'none')};
`;

export const TextButton = styled(Button)`
  width: 100px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: ${COLORS.BLUE_100};
  margin-block-end: 0;
  margin-block-start: 0;
  padding: unset;
  margin: unset;
  padding-inline-start: 0;
  padding-inline-end: 0;
  height: 25px;

  &.add-more-attributes {
    margin-block-end: 1rem;
  }
`;
