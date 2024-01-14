import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import Card from './Card';
import { INftCardType } from './Card.types';

test('renders card component', () => {
  const data: INftCardType = {
    id: '17372',
    createdAt: '02-01-2022',
    title: 'This is title',
    actionType: 'Video',
    fileUrl: 'https://sitechecker.pro/wp-content/uploads/2017/12/URL-meaning.png',
    category: 'Digital Art',
  };

  const props = {
    data,
    onDelete: () => {},
    onMoveUp: () => {},
    onDownUp: () => {},
  };
  render(<Card {...props} />);
  const linkElement = screen.getByText(/This is title/i);
  expect(linkElement).toBeInTheDocument();
});
