import React, { useState } from 'react';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import { ComponentStory } from '@storybook/react';

import ListPopper from './ListPopper';

export default {
  title: 'core/ListPopper',
  component: ListPopper,
};

export const Primary: ComponentStory<typeof ListPopper> = () => {
  const [open, setOpen] = useState(false);

  const Lists = (
    <ListPopper
      Button={<Button onClick={() => setOpen(true)}>Open list</Button>}
      List={
        <Paper>
          <MenuList>
            <MenuItem>List item 1</MenuItem>
            <MenuItem>List item 2</MenuItem>
            <MenuItem>List item with long text 3</MenuItem>
          </MenuList>
        </Paper>
      }
      onClose={() => setOpen(false)}
      open={open}
    />
  );

  return (
    <>
      <div style={{ display: 'flex', flexFlow: 'column', height: 540, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {Lists}
          {Lists}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {Lists}
          {Lists}
        </div>
      </div>
    </>
  );
};
