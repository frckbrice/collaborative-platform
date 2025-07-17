import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Sample Test', () => {
  it('renders a message', () => {
    render(<div>Hello, test!</div>);
    expect(screen.getByText('Hello, test!')).toBeInTheDocument();
  });
}); 