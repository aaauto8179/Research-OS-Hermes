import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession() {
    return { data: null, status: 'unauthenticated' }
  },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(() => ({ data: undefined, error: undefined, isLoading: false })),
  mutate: vi.fn(),
}))

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve(null)),
  NextAuth: vi.fn(() => ({})),
  default: vi.fn(() => ({})),
}))