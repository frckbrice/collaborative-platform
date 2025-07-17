# Real-Time Collaborative Platform

A modern, real-time collaborative platform built with Next.js 15+, Supabase, and Quill Editor. Features real-time document editing, workspace management, and seamless collaboration with live cursors and presence tracking.

## ✨ Features

### 🚀 Core Functionality
- **Real-time Collaboration**: Multiple users can edit documents simultaneously with live cursors and presence tracking
- **Workspace Management**: Create and manage workspaces with folders and files
- **Authentication**: Secure user authentication with Supabase Auth
- **File Management**: Create, edit, and organize files and folders
- **Banner Upload**: Add custom banners to workspaces, folders, and files
- **Emoji Picker**: Customize icons for workspaces, folders, and files
- **Subscription Management**: Premium features with Stripe integration

### 🎨 User Experience
- **Dark Mode Support**: Full dark mode support for all components including Quill editor
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Inline Editing**: Rename workspaces, folders, and files directly in the interface
- **Real-time Updates**: Changes appear instantly for all collaborators
- **Profile Management**: Upload and manage profile pictures

### 🔧 Developer Experience
- **TypeScript**: Full TypeScript support for type safety
- **ESLint**: Code quality and consistency
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Comprehensive Documentation**: Detailed setup and troubleshooting guides

## 🎯 Inline Rename Functionality

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

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/frckbrice/collaborative-platform.git
cd collaborative-platform
```

2. **Install dependencies**:
```bash
yarn install
```

3. **Set up environment variables**:
```bash
cp env.example .env.local
```

4. **Configure your environment variables** in `.env.local`

5. **Start Supabase locally** (optional for development):
```bash
supabase start
```

6. **Run the development server**:
```bash
yarn dev
```

7. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
NEXT_PUBLIC_DATABASE_URL=postgres://postgres:postgres@localhost:54322/postgres

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# JWT Secret (must match the one in docker-compose.yml)
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
```

## 🗄️ Database Setup

1. **Set up your Supabase project**
2. **Run the database migrations**:
```bash
supabase db reset
```

3. **Set up storage buckets and policies** as described in the setup documentation

## 🏗️ Development

### Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn test         # Run tests
```

### Project Structure

```
src/
├── app/                    # Next.js 15 app router
├── components/             # React components
│   ├── features/          # Feature-specific components
│   ├── global-components/ # Shared components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                   # Utilities and configurations
└── utils/                 # Helper functions
```

## 🔄 CI/CD Pipeline

The project includes automated CI/CD workflows:

### CI Workflow (`.github/workflows/ci.yml`)
- **Linting and Type Checking**: Ensures code quality
- **Testing**: Runs test suite
- **Building**: Builds the application
- **Security Scanning**: Checks for vulnerabilities
- **Build Artifacts**: Uploads build files

### Deployment Workflow (`.github/workflows/deploy.yml`)
- **Automatic Deployment**: Deploys to Vercel on push
- **Environment Management**: Separate staging and production environments
- **Branch-based Deployment**: 
  - `main` branch → Production
  - `develop` branch → Preview

## 🛠️ Troubleshooting

For common issues and solutions, see the comprehensive [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide.

### Common Issues
- **Supabase CLI Issues**: Configuration and setup problems
- **Docker Container Problems**: Container conflicts and port issues
- **Email Configuration**: Mailpit setup and SMTP configuration
- **Realtime Collaboration**: Connection and presence tracking issues
- **Authentication Issues**: User management and JWT problems
- **File Upload Problems**: Profile pictures and storage issues

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Submit a pull request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📚 Documentation

- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [Environment Setup](./env.example) - Environment variables reference
- [Database Schema](./migrations/) - Database migrations and schema

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main` branch

### Manual Deployment
```bash
yarn build
yarn start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Quill Editor](https://quilljs.com/) - Rich text editor
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Stripe](https://stripe.com/) - Payment processing
