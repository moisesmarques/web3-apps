import { FieldInputStyled } from './FieldInput.styles';
import { IInputProps } from './FieldInput.types';

const TextareaInput = ({ className, ...props }: IInputProps) => {
  return <FieldInputStyled multiline rows={4} {...props} className={`${className}`} />;
};

export default TextareaInput;
