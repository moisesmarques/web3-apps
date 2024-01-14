import React from 'react';

import { ComponentStory } from '@storybook/react';

import CreateNFT from './CreateNFT';

export default {
  title: 'CreateNFT Modal',
  component: CreateNFT,
};

export const Primary: ComponentStory<typeof CreateNFT> = (props) => {
  return <CreateNFT {...props} />;
};
