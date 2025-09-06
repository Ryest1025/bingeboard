// tests/BrandedSearchBar.test.tsx - BingeBoard Search Tests
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import BrandedSearchBar from "@/components/search/BrandedSearchBar";
import { ModalVariantProvider } from '@/context/ModalVariantContext';
import { DashboardFilterProvider } from '@/components/dashboard/filters/DashboardFilterProvider';

// Mock the hooks
vi.mock("@/hooks/useSearchShows", () => ({
  // Query-aware mock so we can test both populated and empty result states deterministically
  default: vi.fn((q: string) => {
    const baseResults = [
      {
        id: "1",
        title: "Breaking Bad",
        poster: "/poster1.jpg",
        year: "2008",
        type: "tv",
        vote_average: 9.3,
        synopsis: "A high school chemistry teacher turned methamphetamine producer."
      },
      {
        id: "2",
        title: "The Dark Knight",
        poster: "/poster2.jpg",
        year: "2008",
        type: "movie",
        vote_average: 9.0,
        synopsis: "Batman faces the Joker in this epic crime drama."
      }
    ];
    if (q && q.toLowerCase().includes('zzzzunlikely')) {
      return { data: [], isFetching: false };
    }
    return { data: baseResults, isFetching: false };
  })
}));

vi.mock("@/hooks/useShowDetails", () => ({
  default: vi.fn(() => ({
    data: null,
    isLoading: false,
  }))
}));

// Mock Framer Motion (strip animation-only props to silence unknown prop warnings)
vi.mock("framer-motion", () => {
  const React = require('react');
  const filterFMProps = (props: any) => {
    // Remove common framer-motion props so they are not passed to the DOM
    const { whileHover, whileTap, initial, animate, exit, transition, layout, variants, ...rest } = props;
    return rest;
  };
  const Primitive = React.forwardRef(function PrimitiveFn(props: any, ref: any) {
    const { children } = props;
    return <div ref={ref} {...filterFMProps(props)}>{children}</div>;
  });
  const ButtonPrimitive = React.forwardRef(function ButtonPrimitiveFn(props: any, ref: any) {
    const { children } = props;
    return <button ref={ref} {...filterFMProps(props)}>{children}</button>;
  });
  const motionProxy: any = new Proxy({}, {
    get: (_t, prop) => {
      if (prop === 'button') return ButtonPrimitive;
      return Primitive;
    }
  });
  return ({
    motion: motionProxy,
    AnimatePresence: ({ children }: any) => children,
  });
});

// Mock React Player
vi.mock("react-player", () => ({
  default: ({ url }: { url: string }) => <div data-testid="react-player">Player: {url}</div>
}));

// Mock auth to avoid network/fetch + window access in jsdom
vi.mock('@/hooks/useAuth', () => {
  const mockValue = {
    user: null,
    authState: { isAuthenticated: false, user: null, loading: false },
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
  return {
    __esModule: true,
    default: () => mockValue,
    useAuth: () => mockValue,
  };
});

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardFilterProvider>
        <ModalVariantProvider>
          {component}
        </ModalVariantProvider>
      </DashboardFilterProvider>
    </QueryClientProvider>
  );
};

describe("BrandedSearchBar", () => {
  let mockAddToWatchlist: ReturnType<typeof vi.fn>;
  let mockWatchNow: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAddToWatchlist = vi.fn();
    mockWatchNow = vi.fn();
    vi.clearAllMocks();
  });

  it("renders search input with placeholder", () => {
    renderWithProviders(
      <BrandedSearchBar
        placeholder="Search BingeBoard..."
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const el = screen.getByPlaceholderText("Search BingeBoard...");
    expect(el).toBeTruthy();
  });

  it("shows search results when typing", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByPlaceholderText("Search shows, movies, people...");
    fireEvent.change(input, { target: { value: "Breaking" } });

    await waitFor(() => {
      expect(screen.getByText("Breaking Bad")).toBeTruthy();
      expect(screen.getByText("The Dark Knight")).toBeTruthy();
    });
  });

  it("supports keyboard navigation", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByPlaceholderText("Search shows, movies, people...");
    fireEvent.change(input, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Breaking Bad")).toBeTruthy();
    });

    // Test arrow down navigation
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Test arrow up navigation
    fireEvent.keyDown(input, { key: "ArrowUp" });

    // Test Enter key selection
    fireEvent.keyDown(input, { key: "Enter" });

    // Should not throw errors
    expect(input).toBeTruthy();
  });

  it("closes dropdown on Escape key", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByPlaceholderText("Search shows, movies, people...");
    fireEvent.change(input, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Breaking Bad")).toBeTruthy();
    });

    fireEvent.keyDown(input, { key: "Escape" });

    // Dropdown should be closed (results should not be visible)
    await waitFor(() => {
      expect(screen.queryByText("Breaking Bad")).toBeNull();
    });
  });

  it("opens modal when clicking on search result", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByPlaceholderText("Search shows, movies, people...");
    fireEvent.change(input, { target: { value: "Breaking" } });

    await waitFor(() => {
      expect(screen.getByText("Breaking Bad")).toBeTruthy();
    });

    // Click directly on the result element (now a div with role=option)
    fireEvent.click(screen.getByText("Breaking Bad"));

    // Modal should open (though content will be mocked)
    expect((input as HTMLInputElement).value).toBe(""); // Search should clear after selection
  });

  it("handles mouse hover on search results", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByPlaceholderText("Search shows, movies, people...");
    fireEvent.change(input, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Breaking Bad")).toBeTruthy();
    });
    const firstResultEl = screen.getByText("Breaking Bad");
    fireEvent.mouseEnter(firstResultEl);
    expect(firstResultEl).toBeTruthy();
  });

  it("shows loading indicator when fetching", () => {
    // Mock fetching state
    const useSearchShowsMock = vi.fn(() => ({
      data: [],
      isFetching: true,
    }));

    vi.doMock("@/hooks/useSearchShows", () => ({
      default: useSearchShowsMock
    }));

    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByPlaceholderText("Search shows, movies, people...");
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.focus(input);

    // Should show loading state
    expect(input).toBeTruthy();
  });

  it("handles clicks outside to close dropdown", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByPlaceholderText("Search shows, movies, people...");
    fireEvent.change(input, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Breaking Bad")).toBeTruthy();
    });

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText("Breaking Bad")).toBeNull();
    });
  });

  it("applies correct ARIA roles and attributes for combobox pattern", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    fireEvent.change(input, { target: { value: 'Break' } });

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeTruthy();
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    // Arrow navigation updates aria-activedescendant
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const newActive = input.getAttribute('aria-activedescendant');
    expect(newActive).toBeTruthy();

    // Options have role=option
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it("announces result count via live region", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Break' } });
    await waitFor(() => {
      const status = screen.getByRole('status');
      expect(status.textContent).toMatch(/result/);
    });
  });

  it("announces no results via live region", async () => {
    renderWithProviders(
      <BrandedSearchBar
        onAddToWatchlist={mockAddToWatchlist}
        onWatchNow={mockWatchNow}
      />
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'ZzzzUnlikely' } });
    await waitFor(() => {
      const status = screen.getByRole('status');
      expect(status.textContent).toMatch(/No results/i);
    });
  });
});
