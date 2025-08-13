import { render, screen } from '@testing-library/react';
import { NewClientTab } from './NewClientTab';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the auth context
const mockUseAuth = {
  user: { role: 'ADMIN' },
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('NewClientTab', () => {
  it('renders client type selection cards', () => {
    render(
      <AuthProvider>
        <NewClientTab />
      </AuthProvider>
    );

    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('Family')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Phone Call')).toBeInTheDocument();
  });

  it('shows access denied for non-admin users', () => {
    mockUseAuth.user.role = 'USER';

    render(
      <AuthProvider>
        <NewClientTab />
      </AuthProvider>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to create new clients.")).toBeInTheDocument();
  });
});
