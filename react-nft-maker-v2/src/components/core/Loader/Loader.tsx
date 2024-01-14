import { CSSProperties } from 'react';

import CircularProgress from '@mui/material/CircularProgress';

interface LoaderProps {
  style?: CSSProperties;
}

const Loader: React.FC<LoaderProps> = ({ style = {} }): JSX.Element => <CircularProgress style={style} />;

export default Loader;
