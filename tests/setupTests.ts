// tests/setupTests.ts

import '@testing-library/jest-dom';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios', () => {
  const actual = vi.importActual('axios');
  return {
    default: {
      ...actual,
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
      create: vi.fn(() => axios),
    },
  };
});
