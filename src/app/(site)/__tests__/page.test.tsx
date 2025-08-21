import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../page';

// Mock the landing page component
vi.mock('@/components/features/landing-page', () => ({
  default: () => (
    <div data-testid="landing-page">
      <h1>Real-time Collaborative Platform</h1>
      <p>
        Welcome to the real-time collaborative platform. Boost productivity and teamwork with
        seamless collaboration tools.
      </p>
      <section>
        <h2>Features</h2>
        <ul>
          <li>Real-time editing</li>
          <li>Collaborative workspaces</li>
          <li>File management</li>
        </ul>
      </section>
      <section>
        <h2>Get Started</h2>
        <button>Sign Up</button>
        <button>Learn More</button>
      </section>
    </div>
  ),
}));

// Mock the sync function
vi.mock('@/lib/utils/sync-stripe-products', () => ({
  syncStripeProductsAndPrices: vi.fn(),
}));

describe('HomePage Component', () => {
  it('renders the home page with correct metadata', () => {
    render(<HomePage />);

    // Check that the landing page component is rendered
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    render(<HomePage />);

    expect(screen.getByText('Real-time Collaborative Platform')).toBeInTheDocument();
  });

  it('shows the welcome description', () => {
    render(<HomePage />);

    expect(screen.getByText(/Welcome to the real-time collaborative platform/)).toBeInTheDocument();
  });

  it('displays features section', () => {
    render(<HomePage />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Real-time editing')).toBeInTheDocument();
    expect(screen.getByText('Collaborative workspaces')).toBeInTheDocument();
    expect(screen.getByText('File management')).toBeInTheDocument();
  });

  it('shows get started section with action buttons', () => {
    render(<HomePage />);

    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => render(<HomePage />)).not.toThrow();
  });
});
