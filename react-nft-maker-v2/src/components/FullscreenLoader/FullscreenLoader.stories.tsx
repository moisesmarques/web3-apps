import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import FullscreenLoader from './FullscreenLoader';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Loader',
  component: FullscreenLoader,
} as ComponentMeta<typeof FullscreenLoader>;

export const AuthAppLayout: ComponentStory<typeof FullscreenLoader> = () => <FullscreenLoader />;
