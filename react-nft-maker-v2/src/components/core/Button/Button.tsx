import { MouseEventHandler } from 'react';

import { ButtonStyled } from './Button.styles';

interface IButtonProps {
  className?: string;
  type?: 'reset' | 'submit' | 'button';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  name?: string;
  backgroundColor?: string;
  hoverColor?: string;
}

/**
 * Reusable button component
 */
const Button: React.FC<React.PropsWithChildren<IButtonProps>> = ({ children, ...props }) => {
  return <ButtonStyled {...props}>{children}</ButtonStyled>;
};

export default Button;
