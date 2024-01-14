import React, { useState } from 'react';

import { SelectChangeEvent } from '@mui/material/Select';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Filter from './Filter';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Filter',
  component: Filter,
} as ComponentMeta<typeof Filter>;

const filters = ['Option-1', 'Option-2'];

export const CustomFilterComponent: ComponentStory<typeof Filter> = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const handleChange = (event: SelectChangeEvent<typeof filters>) => {
    const {
      target: { value },
    } = event;
    setSelectedFilters(typeof value === 'string' ? value.split(',') : value);
  };
  return <Filter label={'Label'} name="label" filters={filters} value={selectedFilters} handleChange={handleChange} />;
};
