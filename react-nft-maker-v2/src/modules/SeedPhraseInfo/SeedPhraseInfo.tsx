import { COLORS } from '@/constants/colors';
import { ButtonClose, DivContainer, Title, SeedPhraseText } from '@/modules/SeedPhraseInfo/SeedPhraseInfo.styles';

const SeedPhraseInfo = ({ onClose }: { onClose: any }) => {
  return (
    <DivContainer>
      <Title>Information</Title>
      <SeedPhraseText>
        A seed phrase is a 12 word password to your near wallet, that allows you to transfer the contents of your wallet
        on any platform permissionlessly.
      </SeedPhraseText>
      <SeedPhraseText>
        Seed phrases are made avaialble to users who have completed more than 5 on-chain transactions. This is to
        prevent bot attacks, and protect the NEAR ecosystem.
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

export default SeedPhraseInfo;
