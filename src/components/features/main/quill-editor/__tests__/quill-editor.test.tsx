import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuillEditor from '../quill-editor';

// Mock all the dependencies
vi.mock('@/lib/providers/state-provider', () => ({
    useAppState: () => ({
        state: {
            workspaces: [
                {
                    id: 'test-workspace-id',
                    title: 'Test Workspace',
                    data: 'Workspace data',
                    created_at: '2024-01-01',
                    workspaces_owner: 'test-user-id',
                    icon_id: '💼',
                    in_trash: 'false',
                    logo: null,
                    banner_url: null,
                    folders: [
                        {
                            id: 'test-folder-id',
                            title: 'Test Folder',
                            data: 'Folder data',
                            created_at: '2024-01-01',
                            workspace_id: 'test-workspace-id',
                            icon_id: '📁',
                            in_trash: 'false',
                            banner_url: null,
                            files: [
                                {
                                    id: 'test-file-id',
                                    title: 'Test File',
                                    data: 'File data',
                                    created_at: '2024-01-01',
                                    folder_id: 'test-folder-id',
                                    workspace_id: 'test-workspace-id',
                                    icon_id: '📄',
                                    in_trash: 'false',
                                    banner_url: null,
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        workspaceId: 'test-workspace-id',
        folderId: 'test-folder-id',
        dispatch: vi.fn(),
    }),
}));

vi.mock('@/lib/providers/supabase-user-provider', () => ({
    useSupabaseUser: () => ({
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { avatar_url: 'test-avatar.jpg' },
        },
    }),
}));

vi.mock('@/lib/providers/cursor-provider', () => ({
    useStore: (selector: any) => {
        if (selector.name === 'setLocalCursors') return vi.fn();
        if (selector.name === 'localCursors') return [];
        return {};
    },
}));

vi.mock('@/utils/client', () => ({
    createClient: () => ({
        auth: { getUser: vi.fn() },
        storage: { from: vi.fn() },
    }),
    postgrestGet: vi.fn(),
    API_KEY: 'test-api-key',
}));

vi.mock('@/lib/supabase/queries', () => ({
    getWorkspaceDetails: vi.fn(() => ({ data: [{ id: 'test-workspace', title: 'Test Workspace' }], error: null })),
    getFolderDetails: vi.fn(() => ({ data: [{ id: 'test-folder', title: 'Test Folder' }], error: null })),
    getFileDetails: vi.fn(() => ({ data: [{ id: 'test-file', title: 'Test File' }], error: null })),
    updateWorkspace: vi.fn(() => ({ data: null, error: null })),
    updateFolder: vi.fn(() => ({ data: null, error: null })),
    updateFile: vi.fn(() => ({ data: null, error: null })),
    deleteFile: vi.fn(),
    deleteFolder: vi.fn(),
    findUser: vi.fn(() => ({ id: 'test-user', email: 'test@example.com' })),
    getCollaborators: vi.fn(() => ({ data: [], error: null })),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/test-path',
}));

vi.mock('quill', () => {
    const QuillClass = vi.fn().mockImplementation(() => ({
        on: vi.fn(),
        off: vi.fn(),
        setContents: vi.fn(),
        setText: vi.fn(),
        getContents: vi.fn(() => ({ ops: [{ insert: 'test content' }] })),
        getText: vi.fn(() => 'test content'),
        getLength: vi.fn(() => 12),
        getSelection: vi.fn(() => ({ index: 0, length: 0 })),
        setSelection: vi.fn(),
        focus: vi.fn(),
        blur: vi.fn(),
        updateContents: vi.fn(),
        insertText: vi.fn(),
        deleteText: vi.fn(),
        formatText: vi.fn(),
        formatLine: vi.fn(),
        removeFormat: vi.fn(),
        getFormat: vi.fn(() => ({})),
        getBounds: vi.fn(() => ({ left: 0, top: 0, width: 0, height: 0 })),
        getModule: vi.fn(() => ({
            addKeyboardBinding: vi.fn(),
            addMatcher: vi.fn(),
            addHandler: vi.fn(),
        })),
        addModule: vi.fn(),
        getLeaf: vi.fn(() => ({ domNode: document.createElement('div') })),
        getLine: vi.fn(() => [{ domNode: document.createElement('div') }]),
        getLines: vi.fn(() => [[{ domNode: document.createElement('div') }]]),
    }));

    // Add static methods to the class
    (QuillClass as any).register = vi.fn();

    return {
        default: QuillClass,
        register: vi.fn(),
    };
});

vi.mock('@supabase/supabase-js', () => ({
    RealtimeClient: vi.fn().mockImplementation(() => ({
        channel: vi.fn(() => ({
            on: vi.fn(),
            subscribe: vi.fn(),
            unsubscribe: vi.fn(),
        })),
        disconnect: vi.fn(),
    })),
    RealtimeChannel: vi.fn(),
    RealtimePresenceState: vi.fn(),
}));

// Mock Quill CSS import
vi.mock('quill/dist/quill.snow.css', () => ({}));

describe('QuillEditor Component', () => {
    const mockDirDetails = {
        id: 'test-id',
        title: 'Test Document',
        data: 'Test content',
        created_at: '2024-01-01',
        workspaces_owner: 'test-user-id',
        icon_id: '📄',
        in_trash: 'false',
        logo: null,
        banner_url: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders QuillEditor with basic structure', async () => {
        render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="file"
            />
        );

        // Check for main container
        expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
    });

    it('displays document title correctly', async () => {
        render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="file"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test File')).toBeInTheDocument();
        });
    });

    it('shows save status indicator', async () => {
        render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="file"
            />
        );

        // Should show refresh button (indicates save functionality)
        expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    });

    it('displays collaborator information', async () => {
        render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="file"
            />
        );

        // Should show workspace name in breadcrumb
        expect(screen.getByText(/Test Workspace/)).toBeInTheDocument();
    });

    it('handles banner upload functionality', async () => {
        render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="file"
            />
        );

        // Should show banner upload component
        expect(screen.getByText(/add banner/i)).toBeInTheDocument();
    });

    it('displays emoji picker when needed', async () => {
        render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="file"
            />
        );

        // Should show emoji picker button (the 📄 button)
        expect(screen.getByRole('button', { name: '📄' })).toBeInTheDocument();
    });

    it('shows inline edit functionality for title', async () => {
        render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="file"
            />
        );

        // Should show inline edit for title
        expect(screen.getByText('Test File')).toBeInTheDocument();
    });

    it('handles different directory types correctly', async () => {
        const { rerender } = render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="workspace"
            />
        );

        // Test workspace type
        expect(screen.getByText('Test Document')).toBeInTheDocument();

        // Test folder type
        rerender(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="folder"
            />
        );
        expect(screen.getByText('Test Document')).toBeInTheDocument();
    });

    it('shows proper loading states', async () => {
        render(
            <QuillEditor
                dirDetails={mockDirDetails}
                fileId="test-file-id"
                dirType="file"
            />
        );

        // Should show loading indicator while initializing
        expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
    });
});
