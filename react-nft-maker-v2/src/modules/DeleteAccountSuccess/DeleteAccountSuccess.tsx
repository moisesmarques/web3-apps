import { COLORS } from '@/constants/colors';
import { ButtonClose, DivContainer, Title, SeedPhraseText } from '@/modules/SeedPhraseSuccess/SeedPhraseSuccess.styles';

const SeedPhraseSuccess = ({ onClose }: { onClose: any }) => (
  <DivContainer>
    <Title>Success</Title>
    <SeedPhraseText>Your account has been permanently deleted</SeedPhraseText>
    <ButtonClose onClick={() => onClose()} backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
      Good Bye
    </ButtonClose>
  </DivContainer>
);

export default SeedPhraseSuccess;
