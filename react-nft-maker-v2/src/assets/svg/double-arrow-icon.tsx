import { COLORS } from '@/constants/colors';

interface Props {
  isActive: boolean;
}
export const DoubleArrowIcon = ({ isActive }: Props) => {
  return (
    <svg width="30" height="30" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.9601 5.03433L14.7778 5.03019M22.9601 5.03433L4.55904 23.7679L22.9601 5.03433ZM22.9601 5.03433L22.9642 13.3645L22.9601 5.03433Z"
        stroke={isActive ? COLORS.THEME_BUTTON : 'black'}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.8391 36.2699L16.835 27.9397M16.8391 36.2699L35.2402 17.5363L16.8391 36.2699ZM16.8391 36.2699L25.0214 36.2741L16.8391 36.2699Z"
        stroke={isActive ? COLORS.THEME_BUTTON : 'black'}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
