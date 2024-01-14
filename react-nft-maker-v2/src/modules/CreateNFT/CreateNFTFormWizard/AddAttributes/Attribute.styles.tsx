import styled from '@emotion/styled';

export const DivAttributeContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  gap: ${({ isMobile }) => (isMobile ? '0.5rem' : '1rem')};
  margin-block-start: 1rem;
  position: relative;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};

  .input {
    margin-block-end: 0 !important;
    padding-block-start: 0 !important;
    padding-block-end: 0 !important;
  }
`;

export const DivAttributesWrapper = styled.div`
  margin-block-end: 0.5rem;
`;

export const DivRemoveContainer = styled.div`
  position: absolute;
  right: -35px;
  transform: translateY(16px);
  cursor: pointer;
`;
