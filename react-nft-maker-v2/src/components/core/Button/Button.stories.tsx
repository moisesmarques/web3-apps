import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from './Button';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'core/Button',
  component: Button,
} as ComponentMeta<typeof Button>;

export const Primary: ComponentStory<typeof Button> = () => <Button>Button</Button>;

export const DisabledButton: ComponentStory<typeof Button> = () => <Button disabled>Disabled Button</Button>;
