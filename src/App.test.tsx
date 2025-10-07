import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders geocoder test heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Geocoder-v2 Test/i);
    expect(headingElement).toBeInTheDocument();
  });
});
