import { FieldInputStyled } from './FieldInput.styles';
import { IInputProps } from './FieldInput.types';

const FieldInput = ({ className, ...props }: IInputProps) => {
  return <FieldInputStyled {...props} className={`${className}`} />;
};

export default FieldInput;
