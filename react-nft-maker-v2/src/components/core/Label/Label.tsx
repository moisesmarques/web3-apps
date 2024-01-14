import InputLabel, { InputLabelProps } from '@mui/material/InputLabel';

const Label: React.FC<React.PropsWithChildren<InputLabelProps>> = ({ children, className, htmlFor }): JSX.Element => {
  return (
    <InputLabel className={`text-sm ${className}`} htmlFor={htmlFor}>
      {children}
    </InputLabel>
  );
};

export default Label;
