import React from 'react';

import { ComponentStory } from '@storybook/react';

import SendNft from '.';

export default {
  title: 'Send Nft Modal',
  component: SendNft,
};

export const Primary: ComponentStory<typeof SendNft> = (props) => {
  return <SendNft {...props} />;
};
