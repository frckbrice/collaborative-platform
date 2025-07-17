# 🚀 Real-Time Collaborative Platform

<div align="center">

![Collaborative Platform](public/project-images/26.png)

**A modern, real-time collaborative platform built with cutting-edge technologies for seamless team collaboration.**

[![Next.js](https://img.shields.io/badge/Next.js-15lack?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-50blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Real--time-orange?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🖼️ Screenshots](#️-screenshots)
- 🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [🏗️ Project Structure](#️-project-structure)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [🤝 Contributing](#-contributing)
- [📚 Documentation](#-documentation)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 Core Functionality
- **Real-time Collaboration**: Multiple users can edit documents simultaneously with live cursors and presence tracking
- **Workspace Management**: Create and organize workspaces with folders and files
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

---

## 🖼️ Screenshots

<div align="center>

### 🏠 Landing Page
![Landing Page](public/project-images/26.png)
![Landing Page](public/project-images/25.png)

### 📝 Real-time Editor
![Real-time Editor](public/project-images/3.png)
![Collaboration](public/project-images/13.png)


### 👥 Collaboration
![Collaboration](public/project-images/2.png)
![Collaboration](public/project-images/15.png)
![Collaboration](public/project-images/19.png)

![Collaboration](public/project-images/10.png)
![Collaboration](public/project-images/12.png)

### 🎨 Dark Mode
![Dark Mode](public/project-images/6.png)
![Dark Mode](public/project-images/7.png)

### 📁 Workspace Management
![Workspace Management](public/project-images/16.png)
![Collaboration](public/project-images/24.png)


### 🔐 Authentication
![Authentication](public/project-images/8.png)

### ⚙️ Settings & Profile
![Settings](public/project-images/9.png)

### 📱 Mobile Responsive
![Mobile](public/project-images/10.png)

</div>

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and better DX
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Quill Editor](https://quilljs.com/)** - Rich text editor with real-time collaboration
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Storage
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database queries

### Real-time Features
- **[Supabase Realtime](https://supabase.com/docs/guides/realtime)** - Real-time subscriptions
- **[Quill Cursors](https://github.com/reedsy/quill-cursors)** - Collaborative cursors
- **[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)** - Real-time communication

### Development & Deployment
- **[Yarn](https://yarnpkg.com/)** - Package manager
- **[ESLint](https://eslint.org/)** - Code linting
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipeline
- **[Vercel](https://vercel.com/)** - Deployment platform

### Payment Integration
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Webhooks](https://stripe.com/docs/webhooks)** - Payment event handling

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18rn package manager
- Supabase account
- Stripe account (for payments)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/frckbrice/collaborative-platform.git
cd collaborative-platform
```

2. **Install dependencies**
```bash
yarn install
```

3. **Set up environment variables**
```bash
cp env.example .env.local
```

4. **Configure your environment variables** in `.env.local`

5. **Start the development server**
```bash
yarn dev
```
6 **Open** [http://localhost:3000](http://localhost:3000 in your browser

---

## 📦 Installation

### Step 1: Environment Setup

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
NEXT_PUBLIC_DATABASE_URL=postgres://postgres:postgres@localhost:54322postgres

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# JWT Secret (must match the one in docker-compose.yml)
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32racters-long
```

### Step2: Database Setup1 **Set up your Supabase project**
2. **Run the database migrations**:
```bash
supabase db reset
```

3. **Set up storage buckets and policies** as described in the setup documentation

### Step 3: Start Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Run linting
yarn lint

# Run tests
yarn test

# Build for production
yarn build
```

---

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Enable the following services:
   - Authentication
   - Database
   - Storage
   - Realtime
3. Configure authentication providers4up storage buckets for file uploads

### Stripe Setup

1e a Stripe account
2. Get your API keys from the dashboard
3. Configure webhooks for payment events
4. Set up subscription products

### Local Development

For local development with Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Reset database
supabase db reset
```

---

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js15app router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── (site)/            # Landing page
│   └── api/               # API routes
├── components/             # React components
│   ├── features/          # Feature-specific components
│   │   ├── auth/          # Authentication components
│   │   ├── main/          # Main app components
│   │   └── settings/      # Settings components
│   ├── global-components/ # Shared components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                   # Utilities and configurations
│   ├── providers/         # React context providers
│   ├── supabase/          # Supabase configuration
│   └── stripe/            # Stripe configuration
└── utils/                 # Helper functions
```

---

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

---

## 🤝 Contributing

We welcome contributions! This project is free for collaboration.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**4ests if applicable**
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7mit a pull request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all CI checks pass
- Use TypeScript for all new code
- Follow the project's commit message conventions

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the project's coding standards

---

## 📚 Documentation

- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Environment Setup](./env.example)** - Environment variables reference
- **[Database Schema](./migrations/)** - Database migrations and schema
- **[API Documentation](./src/app/api/)** - API endpoints documentation

### Common Issues

- **Supabase CLI Issues**: Configuration and setup problems
- **Docker Container Problems**: Container conflicts and port issues
- **Email Configuration**: Mailpit setup and SMTP configuration
- **Realtime Collaboration**: Connection and presence tracking issues
- **Authentication Issues**: User management and JWT problems
- **File Upload Problems**: Profile pictures and storage issues

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main` branch

### Manual Deployment

```bash
# Build the application
yarn build

# Start the production server
yarn start
```

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - React framework
- **[Supabase](https://supabase.com/)** - Backend as a service
- **[Quill Editor](https://quilljs.com/)** - Rich text editor
- **[shadcn/ui](https://ui.shadcn.com/)** - UI components
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database ORM

---

<div align="center>**Made with ❤️ for the open-source community**

[![GitHub stars](https://img.shields.io/github/stars/frckbrice/collaborative-platform?style=social)](https://github.com/frckbrice/collaborative-platform)
[![GitHub forks](https://img.shields.io/github/forks/frckbrice/collaborative-platform?style=social)](https://github.com/frckbrice/collaborative-platform)
[![GitHub issues](https://img.shields.io/github/issues/frckbrice/collaborative-platform)](https://github.com/frckbrice/collaborative-platform/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/frckbrice/collaborative-platform)](https://github.com/frckbrice/collaborative-platform/pulls)

</div> 
