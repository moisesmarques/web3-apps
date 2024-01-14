import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import NoRecordFound from './NoRecordFound';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Your transactions will appear here',
  component: NoRecordFound,
} as ComponentMeta<typeof NoRecordFound>;

export const NoRecord: ComponentStory<typeof NoRecordFound> = () => (
  <NoRecordFound text="Your transactions will appear here" />
);
