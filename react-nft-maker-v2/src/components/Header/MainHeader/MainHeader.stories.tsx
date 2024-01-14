import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import MainHeader from './MainHeader';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'MainHeader',
  component: MainHeader,
} as ComponentMeta<typeof MainHeader>;

export const Header: ComponentStory<typeof MainHeader> = () => (
  <MainHeader isLogo={true} IsShowNFTContent={true}></MainHeader>
);
