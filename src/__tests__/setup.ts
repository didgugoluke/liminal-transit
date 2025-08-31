import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock crypto.randomUUID for tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    search: '',
    href: 'http://localhost:3000',
  },
  writable: true,
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock sessionStorage and localStorage
const createStorageMock = () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
});

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
});