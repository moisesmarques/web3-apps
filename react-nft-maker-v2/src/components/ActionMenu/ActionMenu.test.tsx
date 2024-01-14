import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import ActionMenu from './ActionMenu';

const props = {
  onSelectAll: jest.fn(),
  onSelect: jest.fn(),
  onMoveUp: jest.fn(),
  onMoveDown: jest.fn(),
  onDelete: jest.fn(),
};

describe('ActionMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should open the ActionMenu', () => {
    const { getByRole } = render(<ActionMenu {...props} />);
    const expandButton = getByRole('button', { name: 'Expand' });
    fireEvent.click(expandButton);
    expect(getByRole('tooltip')).toBeInTheDocument();
  });

  it('Should call onSelectAll callback', () => {
    const { getByRole } = render(<ActionMenu {...props} />);
    const expandButton = getByRole('button', { name: 'Expand' });
    fireEvent.click(expandButton);

    const configureList = getByRole('menuitem', { name: 'Select All' });

    fireEvent.click(configureList);
    expect(props.onSelectAll).toHaveBeenCalledTimes(1);
  });

  it('Should call onSelect callback', () => {
    const { getByRole } = render(<ActionMenu {...props} />);
    const expandButton = getByRole('button', { name: 'Expand' });
    fireEvent.click(expandButton);

    const configureList = getByRole('menuitem', { name: 'Select' });

    fireEvent.click(configureList);
    expect(props.onSelect).toHaveBeenCalledTimes(1);
  });

  it('Should call onMoveUp callback', () => {
    const { getByRole } = render(<ActionMenu {...props} />);
    const expandButton = getByRole('button', { name: 'Expand' });
    fireEvent.click(expandButton);

    const configureList = getByRole('menuitem', { name: 'Move Up' });

    fireEvent.click(configureList);
    expect(props.onMoveUp).toHaveBeenCalledTimes(1);
  });

  it('Should call onMoveDown callback', () => {
    const { getByRole } = render(<ActionMenu {...props} />);
    const expandButton = getByRole('button', { name: 'Expand' });
    fireEvent.click(expandButton);

    const configureList = getByRole('menuitem', { name: 'Move Down' });

    fireEvent.click(configureList);
    expect(props.onMoveDown).toHaveBeenCalledTimes(1);
  });

  it('Should call onDelete callback', () => {
    const { getByRole } = render(<ActionMenu {...props} />);
    const expandButton = getByRole('button', { name: 'Expand' });
    fireEvent.click(expandButton);

    const deleteList = getByRole('menuitem', { name: 'Delete list' });

    fireEvent.click(deleteList);
    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });
});
