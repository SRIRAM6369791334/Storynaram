import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../src/components/ui/button';

describe('Button component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('applies variant classes', () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByText('Primary');
    expect(btn.className).toContain('bg-primary');
  });
});
