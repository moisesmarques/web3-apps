import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import Accordion from './Accordion';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Accordion',
  component: Accordion,
} as ComponentMeta<typeof Accordion>;

export const CustomFilterComponent: ComponentStory<typeof Accordion> = () => {
  return <Accordion title="Title">content</Accordion>;
};
