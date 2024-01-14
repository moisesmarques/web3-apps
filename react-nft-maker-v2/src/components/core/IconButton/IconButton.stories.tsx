import React from 'react';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import IconButton from './IconButton';

export default {
  title: 'core/IconButton',
  component: IconButton,
  argTypes: {
    variant: {
      options: ['primary', 'secondary'],
      control: { type: 'select' },
    },
    disabled: {
      options: [true, false],
      control: { type: 'checkbox' },
    },
  },
  parameters: {
    componentSubtitle: (
      <>
        <div>This component supports all props from material-ui IconButton component.</div>
        <div>
          Documentation: <a href="https://mui.com/components/buttons/">https://mui.com/components/buttons/</a>
        </div>
      </>
    ),
  },
} as ComponentMeta<typeof IconButton>;

export const Primary: ComponentStory<typeof IconButton> = (args) => (
  <IconButton aria-label="action menu" {...args}>
    <MoreHorizIcon />
  </IconButton>
);
