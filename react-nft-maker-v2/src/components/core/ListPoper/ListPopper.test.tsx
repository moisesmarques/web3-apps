import React from 'react';

import { render, fireEvent } from '@testing-library/react';

import ListPopper from './ListPopper';

const props = {
  Button: <button type="button">Open list</button>,
  List: <div>List of lists</div>,
  onClose: jest.fn(),
  open: false,
};

describe('ListPopper', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('Should render correctly', () => {
    const { container } = render(<ListPopper {...props} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('Should open the list', () => {
    const { getByText } = render(<ListPopper {...props} open />);
    expect(getByText('List of lists')).toBeInTheDocument();
  });

  it('Should close the list on click outside', () => {
    const onClose = jest.fn();
    render(<ListPopper {...props} onClose={onClose} open />);
    jest.advanceTimersByTime(0);
    fireEvent.click(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
