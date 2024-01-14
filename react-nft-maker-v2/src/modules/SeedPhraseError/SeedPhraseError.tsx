import { Fragment } from 'react';

import { COLORS } from '@/constants/colors';
import {
  ButtonOpen,
  DivContainer,
  PreventBotAttacks,
  ErrorTitle,
  UserNearApp,
  SeedPhraseText,
} from '@/modules/SeedPhraseError/SeedPhraseError.styles';

const SeedPhraseError = ({ onClose, message }: { onClose: any; message: string }) => {
  return (
    <DivContainer>
      <ErrorTitle>Error</ErrorTitle>
      {message ? (
        <SeedPhraseText>{message}</SeedPhraseText>
      ) : (
        <Fragment>
          <SeedPhraseText>
            Your seed phrase becomes availalbe after you have completed 5 or more on-chain transactions.
          </SeedPhraseText>
          <UserNearApp>You can use any NEARApp until then.</UserNearApp>
          <PreventBotAttacks>This is to prevent bot attacks.</PreventBotAttacks>
        </Fragment>
      )}
      <ButtonOpen onClick={() => onClose(false)} backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
        Close
      </ButtonOpen>
    </DivContainer>
  );
};

export default SeedPhraseError;
