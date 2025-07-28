# Mailing System Documentation

This document describes the mailing system implementations available in the application and their configuration requirements.

## Overview

The mailing system supports multiple providers through a unified interface. Each implementation handles template rendering and email delivery according to the provider's specific requirements.

## Template System

All mailer implementations use HTML templates for consistent email formatting and content management. Templates support dynamic data injection and can be customized for your specific needs.

### Template Location
- **Embedded**: `internal/mailer/templates/*.html`
- **Override**: `templates/*.html` (in working directory)

For detailed template documentation, available templates, customization options, and data field specifications, see [Templates Documentation](templates/TEMPLATES.md).

## Available Implementations

### 1. SMTP Mailer

**File**: `internal/mailer/smtp.go`  
**Type**: `smtp`  
**Description**: Traditional SMTP email delivery using the `gomail` library.

#### Environment Variables

```env
# Type of mailer to use
MAILER_TYPE=smtp

# SMTP server hostname (e.g., smtp.gmail.com, smtp.office365.com)
MAILER_HOST=smtp.gmail.com

# SMTP server port (587 for TLS, 465 for SSL, 25 for plain)
MAILER_PORT=587

# Email address used for authentication
MAILER_USERNAME=your-email@gmail.com

# Password or app-specific password for authentication
MAILER_PASSWORD=your-app-password
```

---

### 2. Resend Mailer

**File**: `internal/mailer/resend.go`  
**Type**: `resend`  
**Description**: Modern email API using Resend service for high deliverability.

#### Environment Variables

```env
# Type of mailer to use
MAILER_TYPE=resend

# Your Resend API key (starts with 're_')
MAILER_API_KEY=re_1234567890abcdef

# Default from address (must be verified in Resend dashboard)
MAILER_USERNAME=noreply@yourdomain.com
```

---

### 3. Mock Mailer

**File**: `internal/mailer/mock.go`  
**Type**: `mock`  
**Description**: Testing implementation that stores emails instead of sending them.

#### Environment Variables

```env
# Type of mailer to use
MAILER_TYPE=mock

# Default from address (for testing purposes)
MAILER_USERNAME=test@example.com
```

## Common Configuration

All mailer implementations share these common configuration options:

### Required Environment Variables

```env
# Mailer type (smtp, resend, mock)
MAILER_TYPE=smtp

# Default from address
MAILER_USERNAME=noreply@yourdomain.com
```

### Optional Environment Variables

```env
# SMTP server hostname
MAILER_HOST=smtp.gmail.com

# SMTP server port
MAILER_PORT=587

# SMTP authentication password
MAILER_PASSWORD=your-password

# API key for cloud mailers (Resend, SendGrid, etc.)
MAILER_API_KEY=your-api-key
```

## Security Considerations

1. **API Keys**: Store securely, never commit to version control
2. **Passwords**: Use app-specific passwords for SMTP
3. **From Address**: Use verified domains/addresses
4. **Rate Limiting**: Respect provider rate limits
5. **TLS**: Always use TLS for SMTP connections

## Troubleshooting

### SMTP Issues
- Verify credentials and server settings
- Check firewall/network connectivity
- Ensure TLS/SSL settings match server requirements

### Resend Issues
- Verify API key is correct
- Ensure from address is verified in Resend dashboard
- Check rate limits and account status

### Template Issues
- Verify template files exist
- Check template syntax (Go html/template)
- Ensure data structure matches template expectations 