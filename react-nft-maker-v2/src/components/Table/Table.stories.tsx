import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import Table, { IColumnType } from './Table';

const columns: IColumnType[] = [
  {
    name: 'Name',
    key: 'name',
  },
  {
    name: 'Title',
    key: 'title',
  },
  {
    name: 'Role',
    key: 'role',
  },
  {
    name: 'Email',
    key: 'email',
  },
];

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Table',
  component: Table,
} as ComponentMeta<typeof Table>;

export const EmptyTable: ComponentStory<typeof Table> = () => <Table columns={columns} data={[]} />;

const data = [
  {
    id: 1,
    name: 'Shahid',
    title: 'Developer',
    email: 'shahid@primelab.io',
    role: 'Admin',
  },
  {
    id: 2,
    name: 'Doug',
    title: 'Lead',
    email: 'doug@primelab.io',
    role: 'Admin',
  },
  {
    id: 3,
    name: 'Rohit',
    title: 'Developer',
    email: 'rohit@primelab.io',
    role: 'Admin',
  },
];

export const CustomTable: ComponentStory<typeof Table> = () => <Table columns={columns} data={data} />;
