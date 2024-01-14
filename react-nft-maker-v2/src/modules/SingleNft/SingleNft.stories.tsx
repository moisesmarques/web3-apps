import React from 'react';

import { action } from '@storybook/addon-actions';
import { ComponentStory } from '@storybook/react';

import SingleNft from './SingleNft';

export default {
  title: 'NftDetailsModal',
  component: SingleNft,
};

export const Primary: ComponentStory<typeof SingleNft> = () => {
  return <SingleNft handleClose={action('')} />;
};
