import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthLayout from './AuthLayout';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Layout',
  component: AuthLayout,
} as ComponentMeta<typeof AuthLayout>;

export const AuthAppLayout: ComponentStory<typeof AuthLayout> = () => <AuthLayout>Right Section</AuthLayout>;
