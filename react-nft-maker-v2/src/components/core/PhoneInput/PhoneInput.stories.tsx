import { ComponentMeta, ComponentStory } from '@storybook/react';

import PhoneInput from '.';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'PhoneInput',
  component: PhoneInput,
} as ComponentMeta<typeof PhoneInput>;

export const Main: ComponentStory<typeof PhoneInput> = ({ ...props }) => <PhoneInput {...props} />;
