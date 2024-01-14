import React from 'react';

import { action } from '@storybook/addon-actions';
import { ComponentStory } from '@storybook/react';

import ActionMenu from './ActionMenu';

export default {
  title: 'ActionMenu',
  component: ActionMenu,
};

export const Primary: ComponentStory<typeof ActionMenu> = () => {
  return (
    <>
      <div style={{ float: 'left' }}>
        <ActionMenu
          onSelectAll={action('onSelectAll')}
          onSelect={action('onSelect')}
          onMoveUp={action('onMoveUp')}
          onMoveDown={action('onMoveDown')}
          onDelete={action('onDelete')}
        />
      </div>
      <div style={{ float: 'right' }}>
        <ActionMenu
          onSelectAll={action('onSelectAll')}
          onSelect={action('onSelect')}
          onMoveUp={action('onMoveUp')}
          onMoveDown={action('onMoveDown')}
          onDelete={action('onDelete')}
        />
      </div>
    </>
  );
};
