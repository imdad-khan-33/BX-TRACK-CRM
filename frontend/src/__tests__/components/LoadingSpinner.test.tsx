import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container).toBeInTheDocument();
  });

  it('should render with medium size by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('div > div');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('div > div');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('div > div');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('should have animation class', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('div > div');
    expect(spinner).toHaveClass('animate-spin');
  });
});
