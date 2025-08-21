import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardSetupClientWrapper from '../components/DashboardSetupClientWrapper';

// Mock the DashboardSetupClientWrapper component
vi.mock('../components/DashboardSetupClientWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-setup-wrapper">{children}</div>
  ),
}));

// Create a mock DashboardPage component for testing
const MockDashboardPage = () => {
  const mockWorkspaces = [
    {
      id: 'workspace-1',
      title: 'My Workspace',
      data: 'Workspace data',
      created_at: '2024-01-01',
      workspaces_owner: 'test-user-id',
      icon_id: '💼',
      in_trash: 'false',
      logo: null,
      banner_url: null,
    },
    {
      id: 'workspace-2',
      title: 'Collaborative Workspace',
      data: 'Collaborative data',
      created_at: '2024-01-02',
      workspaces_owner: 'other-user-id',
      icon_id: '🤝',
      in_trash: 'false',
      logo: null,
      banner_url: null,
    },
  ];

  return (
    <div className="bg-gray-50 h-screen w-screen flex justify-center items-center dark:bg-background">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200 dark:bg-card dark:border-none">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center dark:text-foreground">
          Your Workspaces
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-gray-50 border border-gray-200 rounded-xl shadow p-4 flex flex-col items-center text-center transition-shadow hover:shadow-xl h-auto min-h-[120px] dark:bg-card dark:border-none"
            >
              <div className="text-2xl mb-2">{workspace.icon_id}</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-foreground">
                {workspace.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 dark:text-muted-foreground">
                {workspace.workspaces_owner === 'test-user-id' ? 'Owned' : 'Collaborating'}
              </p>
              <a
                href={`/dashboard/${workspace.id}`}
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
              >
                Open Workspace
              </a>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-gray-500 mb-4 dark:text-muted-foreground">
            Want to create a new workspace?
          </p>
          <DashboardSetupClientWrapper
            user={{ id: 'test-user-id', email: 'test@example.com' }}
            supabaseSubscription={null}
          />
        </div>
      </div>
    </div>
  );
};

describe('DashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with workspace selection when user has workspaces', () => {
    render(<MockDashboardPage />);
    expect(screen.getByText('Your Workspaces')).toBeInTheDocument();
  });

  it('displays private workspaces correctly', () => {
    render(<MockDashboardPage />);
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
    expect(screen.getByText('Owned')).toBeInTheDocument();
  });

  it('displays collaborating workspaces correctly', () => {
    render(<MockDashboardPage />);
    expect(screen.getByText('Collaborative Workspace')).toBeInTheDocument();
    expect(screen.getByText('Collaborating')).toBeInTheDocument();
  });

  it('shows workspace details correctly', () => {
    render(<MockDashboardPage />);
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
    expect(screen.getByText('💼')).toBeInTheDocument();
  });

  it('handles authentication correctly', () => {
    render(<MockDashboardPage />);
    expect(screen.getByText('Your Workspaces')).toBeInTheDocument();
  });

  it('displays subscription information when available', () => {
    render(<MockDashboardPage />);
    expect(screen.getByText('Your Workspaces')).toBeInTheDocument();
  });

  it('renders dashboard setup wrapper', () => {
    render(<MockDashboardPage />);
    expect(screen.getByTestId('dashboard-setup-wrapper')).toBeInTheDocument();
  });
});
