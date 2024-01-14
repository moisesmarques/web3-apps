import { ComponentMeta, ComponentStory } from '@storybook/react';

import Loader from '.';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Loader',
  component: Loader,
} as ComponentMeta<typeof Loader>;

export const Main: ComponentStory<typeof Loader> = ({ ...props }) => <Loader {...props} />;
