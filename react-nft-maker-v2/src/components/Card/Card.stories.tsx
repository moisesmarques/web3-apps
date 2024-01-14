import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import Card from './Card';
import { INftCardType } from './Card.types';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'NFT Card',
  component: Card,
} as ComponentMeta<typeof Card>;

const data: INftCardType = {
  id: '17372',
  createdAt: '02-01-2022',
  title: 'This is title',
  actionType: 'Video',
  fileUrl: 'https://sitechecker.pro/wp-content/uploads/2017/12/URL-meaning.png',
  category: 'Digital Art',
  isSelected: false,
};

export const NftCard: ComponentStory<typeof Card> = (args) => <Card {...args} />;

NftCard.args = {
  data,
  onDelete: () => {},
  onMoveUp: () => {},
  onDownUp: () => {},
};
