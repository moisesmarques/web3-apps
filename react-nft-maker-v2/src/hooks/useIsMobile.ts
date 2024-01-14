import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

type DeviceSizeProps = {
  type: 'up' | 'down' | 'only' | 'not';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const useDeviceSize = ({ type, size }: DeviceSizeProps) => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints[type](size));
};

export const useIsMobile = () =>
  useDeviceSize({
    type: 'down',
    size: 'md',
  });
