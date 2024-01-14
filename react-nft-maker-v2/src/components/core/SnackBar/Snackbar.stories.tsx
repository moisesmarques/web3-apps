import React from 'react';

import { useState } from '@storybook/addons';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from '../Button';
import SnackBar from './SnackBar';

export default {
  /**  👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'core/SnackBar',
  component: SnackBar,
  argTypes: {
    type: {
      options: ['success', 'error', 'warning'],
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof SnackBar>;

export const Success: ComponentStory<typeof SnackBar> = ({ type }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(!open);
        }}
      >
        Click Me
      </Button>
      <SnackBar content="This is test SnackBar" visible={open} setVisible={setOpen} type={type} />
    </>
  );
};
