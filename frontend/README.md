# Treenode Frontend

A modern Next.js frontend for the Treenode application, allowing users to create and manage beautiful link pages.

## Features

- **Authentication System**: Login, register, and password management
- **Dashboard**: Manage your link pages and view statistics
- **Node Management**: Create, edit, and delete link pages
- **Public Pages**: Beautiful, customizable link pages accessible via subdomains
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Lucide React**: Beautiful icons
- **Radix UI**: Accessible UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:9520
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/             # Authentication pages
│   │   ├── register/
│   │   ├── nodes/             # Node management pages
│   │   ├── [subdomain]/       # Public subdomain pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard page
│   ├── components/            # Reusable UI components
│   │   └── ui/               # shadcn/ui components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and API client
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
└── package.json
```

## Key Components

### Authentication
- **AuthProvider**: Manages user authentication state
- **Login/Register Pages**: User authentication forms
- **Protected Routes**: Automatic redirect to login for unauthenticated users

### Dashboard
- **Main Dashboard**: Overview of user's link pages
- **Node Management**: Create and manage link pages
- **Quick Actions**: Easy access to common tasks

### Public Pages
- **Dynamic Routes**: `[subdomain]/page.tsx` handles public link pages
- **Responsive Design**: Beautiful layouts for all devices
- **Link Management**: Display and handle user links

## API Integration

The frontend communicates with the backend through the `apiClient` in `src/lib/api.ts`. Key features:

- **Automatic Token Refresh**: Handles JWT token expiration
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript integration
- **Cookie Management**: Automatic session handling

## Configuration

### Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL (default: http://localhost:9520)

### Styling

The application uses a custom design system with:
- **Cottage Theme**: Warm, welcoming color palette
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components
- **Dark Mode**: Built-in dark mode support

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Component Structure**: Consistent component organization

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
