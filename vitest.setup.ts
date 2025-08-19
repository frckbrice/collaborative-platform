import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Make React available globally
global.React = React;

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase/config', () => ({
  createClientComponentClient: () => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: 'test-url' } }),
        upload: vi.fn(),
        remove: vi.fn(),
      }),
    },
  }),
  createClient: () => ({
    auth: {
      getUser: vi.fn(),
    },
  }),
}));

// Global test environment setup
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Global Quill mock to prevent "Quill.register is not a function" errors
(global as any).Quill = {
  register: vi.fn(),
};
