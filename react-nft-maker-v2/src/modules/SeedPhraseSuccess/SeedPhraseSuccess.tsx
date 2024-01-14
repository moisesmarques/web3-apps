import { COLORS } from '@/constants/colors';
import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import { ButtonClose, DivContainer, Title, SeedPhraseText } from '@/modules/SeedPhraseSuccess/SeedPhraseSuccess.styles';
import { getAuthDataSelector } from '@/store/auth';

const SeedPhraseSuccess = ({ onClose }: { onClose: any }) => {
  const { user } = useAppSelector(getAuthDataSelector);
  return (
    <DivContainer>
      <Title>Success</Title>
      <SeedPhraseText>
        Success Your seedphrase will be sent to {user && user.email ? user.email : user.phone}
      </SeedPhraseText>
      <ButtonClose
        onClick={() => onClose(false)}
        backgroundColor={COLORS.THEME_BUTTON}
        hoverColor={COLORS.THEME_BUTTON}
      >
        Close
      </ButtonClose>
    </DivContainer>
  );
};

export default SeedPhraseSuccess;
