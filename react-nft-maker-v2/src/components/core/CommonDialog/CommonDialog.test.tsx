import { fireEvent, render, screen } from '@testing-library/react';

import CommonDialog from '.';

describe('Common dialog component', () => {
  const handleClose = jest.fn();
  test('Render common dialog components', () => {
    render(
      <CommonDialog title="Component Test" open onClose={handleClose}>
        Test Components
      </CommonDialog>
    );
    const linkElement = screen.getByTestId('common-dialog-component');
    expect(linkElement).toBeInTheDocument();
  });

  test('Close modal', () => {
    render(
      <CommonDialog title="Component Test" open onClose={handleClose}>
        Test Components
      </CommonDialog>
    );
    const closeButton = screen.getByTestId('close-button');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
