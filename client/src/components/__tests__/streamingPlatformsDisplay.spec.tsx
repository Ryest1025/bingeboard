import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamingPlatformsDisplay, StreamingPlatformBasic } from '../streaming/StreamingPlatformsDisplay';

const mk = (n: string): StreamingPlatformBasic => ({ provider_id: n, provider_name: n });

describe('StreamingPlatformsDisplay', () => {
  it('renders nothing when empty', () => {
    const { container } = render(<StreamingPlatformsDisplay platforms={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('respects compact mode limit (3)', () => {
    render(<StreamingPlatformsDisplay platforms={[mk('A'), mk('B'), mk('C'), mk('D')]} compact />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('maxVisible overrides compact', () => {
    render(<StreamingPlatformsDisplay platforms={[mk('A'), mk('B'), mk('C'), mk('D')]} compact maxVisible={2} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('disables buttons when no click handler provided', () => {
    render(<StreamingPlatformsDisplay platforms={[mk('A')]} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('disabled');
  });

  it('fires onPlatformClick when provided', () => {
    const clicks: string[] = [];
    render(<StreamingPlatformsDisplay platforms={[mk('A')]} onPlatformClick={(p) => clicks.push(String(p.provider_id))} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(clicks).toEqual(['A']);
  });
});
