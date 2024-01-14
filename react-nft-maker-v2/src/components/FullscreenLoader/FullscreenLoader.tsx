import { CircularProgress } from '@mui/material';

import { DivLoaderContainer, LoadingMessage } from './FullscreenLoader.styles';

const FullscreenLoader = ({ message }: { message?: string }) => (
  <DivLoaderContainer>
    <CircularProgress className="loader" />
    {message && <LoadingMessage>{message}</LoadingMessage>}
  </DivLoaderContainer>
);

export default FullscreenLoader;
