import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import MainFooter from './MainFooter';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'MainFooter',
  component: MainFooter,
} as ComponentMeta<typeof MainFooter>;

export const Footer: ComponentStory<typeof MainFooter> = () => <MainFooter />;
