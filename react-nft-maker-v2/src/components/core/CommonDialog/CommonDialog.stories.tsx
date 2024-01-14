import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import CommonDialog from './CommonDialog';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'core/CommonDialog',
  component: CommonDialog,
} as ComponentMeta<typeof CommonDialog>;

export const Dialog: ComponentStory<typeof CommonDialog> = () => (
  <CommonDialog open={true} title={'Dialog'}>
    Common Dialog Box
  </CommonDialog>
);
