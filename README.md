# Treenode

A modern, full-stack application for creating and managing beautiful link pages. Treenode allows users to create customizable link pages accessible via subdomains, with a focus on performance, security, and user experience.

## 🚀 Features

- **Beautiful Link Pages**: Create stunning, customizable link pages with themes and gradients
- **Subdomain Support**: Each user gets their own subdomain for their link page
- **Authentication System**: Secure login, registration, and password management
- **Dashboard**: Manage your link pages and view statistics
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern Tech Stack**: Built with Go (backend) and Next.js (frontend)

## 📁 Project Structure

```
treenode/
├── backend/          # Go backend server
├── frontend/         # Next.js frontend application
```

## 🛠 Tech Stack

### Backend
- **Go**: High-performance server language
- **Chi Router**: Lightweight HTTP router
- **JWT Authentication**: Cookie-based session management
- **PostgreSQL/SQLite**: Database support
- **Swagger**: API documentation
- **Rate Limiting**: Security and performance
- **Email System**: SMTP and Resend support

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

## 🚀 Quick Start

### Prerequisites

- **Backend**: Go 1.21+, PostgreSQL (or SQLite for development)
- **Frontend**: Node.js 18+, npm or yarn

### 1. Backend Setup

Navigate to the backend directory and follow the detailed setup instructions:

```bash
cd backend
```

See [Backend README](backend/README.md) for complete setup instructions, including:
- Environment configuration
- Database setup
- Development mode
- Deployment options

### 2. Frontend Setup

Navigate to the frontend directory and follow the detailed setup instructions:

```bash
cd frontend
```

See [Frontend README](frontend/README.md) for complete setup instructions, including:
- Installation and dependencies
- Environment configuration
- Development server
- Deployment options

### 3. Development

1. **Start Backend**: Follow the backend README to start the Go server
2. **Start Frontend**: Follow the frontend README to start the Next.js development server
3. **Access Application**: Open your browser to the frontend URL (typically http://localhost:3000)

## 📚 Documentation

- **[Backend Documentation](backend/README.md)**: Complete backend setup, configuration, and deployment guide
- **[Frontend Documentation](frontend/README.md)**: Frontend development, features, and deployment guide
- **[API Documentation](backend/docs/)**: Swagger API documentation (available when running in debug mode)

## 🔧 Configuration

### Environment Variables

Both backend and frontend require specific environment variables. See their respective READMEs for complete configuration:

- **Backend**: JWT secrets, database connection, email settings, security options
- **Frontend**: Backend API URL, authentication settings

### Development vs Production

- **Development**: Uses SQLite database, mock email service, debug mode
- **Production**: PostgreSQL database, real email service, HTTPS support

## 🚀 Deployment

### Backend Deployment

The backend can be deployed as:
- **Standalone Server**: Traditional server deployment
- **Serverless**: Using AWS Lambda or similar (planned)
- **Docker**: Containerized deployment (planned)

### Frontend Deployment

The frontend can be deployed to:
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative hosting platform
- **Self-hosted**: Any platform supporting Node.js

## 🔒 Security Features

- **JWT Authentication**: Secure session management
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Cross-origin request security
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content Security Policy

## 🎨 Customization

### Themes and Styling

The frontend supports:
- **Custom Themes**: Beautiful gradient and color themes
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Built-in dark mode support
- **Accessibility**: WCAG compliant components

### Email Templates

The backend includes customizable email templates for:
- Registration confirmation
- Password reset
- Collaborator invitations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](backend/LICENSE) file for details.

## 🆘 Support

For issues and questions:
1. Check the respective README files for detailed documentation
2. Review the API documentation when running in debug mode
3. Open an issue on GitHub for bugs or feature requests

## 🗺 Roadmap

- [ ] Redis caching layer
- [ ] Background job processing
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API rate limiting improvements
- [ ] Mobile app development 