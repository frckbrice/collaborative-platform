# Real-Time Collaborative Platform

A real-time collaborative platform built with Next.js 15+, Supabase, and Quill Editor.

## Features

- **Real-time Collaboration**: Multiple users can edit documents simultaneously with live cursors
- **Workspace Management**: Create and manage workspaces with folders and files
- **Authentication**: Secure user authentication with Supabase Auth
- **File Management**: Create, edit, and organize files and folders
- **Banner Upload**: Add custom banners to workspaces, folders, and files
- **Emoji Picker**: Customize icons for workspaces, folders, and files
- **Subscription Management**: Premium features with Stripe integration
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Rename Functionality

### How to Rename Items

1. **In the Editor Page**: 
   - Click on the title of any workspace, folder, or file to edit it inline
   - Press Enter to save or Escape to cancel
   - The edit icon will appear on hover

2. **In the Sidebar**:
   - Click on any folder or file name in the sidebar to edit
   - Press Enter to save or Escape to cancel
   - Changes are saved automatically

### Supported Items
- **Workspaces**: Click the workspace title in the editor
- **Folders**: Click the folder title in the editor or sidebar
- **Files**: Click the file title in the editor or sidebar

### Features
- **Inline Editing**: No separate dialog or modal required
- **Keyboard Shortcuts**: Enter to save, Escape to cancel
- **Visual Feedback**: Clear indication when editing is active
- **Auto-save**: Changes are saved immediately to the database
- **Real-time Updates**: Changes appear instantly for all collaborators

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd real-time-collaborative-plateform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

1. Set up your Supabase project
2. Run the database migrations:
```bash
npm run db:push
```

3. Set up storage buckets and policies as described in the setup documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
