# Email Templates

All email templates in this project use Go's [html/template](https://pkg.go.dev/html/template) package. This means you can use all standard Go template features, including:

- Variable interpolation: `{{.Var}}`
- Conditionals: `{{if .Var}} ... {{end}}`
- Loops: `{{range .List}} ... {{end}}`
- Built-in functions (see Go docs)
- Automatic HTML escaping for safety

For more details, see the [Go html/template documentation](https://pkg.go.dev/html/template).

---

## Overriding Templates Without Rebuilding

You can override any email template at runtime without rebuilding the application:

- Create a `templates/` directory in the working directory of your executable (where you run your server).
- Place a file with the same name as the template you want to override (e.g., `forgotpassword.html`, `confirmregister.html`) in this directory.
- The application will use your custom template instead of the embedded one (the override is loaded on first use, not hot-reloaded).

This allows you to customize email content and design without recompiling or redeploying your Go binary.

---

This document describes the available email templates and the data fields passed to each template.

---

## forgotpassword.html
**Purpose:** Sent to users who request a password reset.

**Data passed:**
- `Token` (string): The password reset token (raw, not hashed). Used in the reset link and displayed in the email.
- `Url` (string): The base URL for the password reset page. The token is appended as a query parameter.
- `Expiry` (string): Human-readable duration string (e.g., '1 hour', '15 minutes').

**Example usage:**
```go
mailer.Send("forgotpassword", headers, map[string]any{"Token": token.Raw, "Url": url, "Expiry": expiryStr})
```

**Template usage:**
- The reset link: `<a href="{{.Url}}?token={{.Token}}">Reset Password</a>`
- The token is also shown directly in the email for manual entry.
- The expiry is used in the footer and security notes.

---

## confirmregister.html
**Purpose:** Sent to users to confirm their email address after registration.

**Data passed:**
- `Token` (string): The email confirmation token (raw, not hashed). Used in the confirmation link and displayed in the email.
- `Url` (string): The base URL for the email confirmation page. The token is appended as a query parameter.
- `Expiry` (string): Human-readable duration string (e.g., '1 day', '24 hours').

**Example usage:**
```go
mailer.Send("confirmregister", headers, map[string]any{"Token": token.Raw, "Url": url, "Expiry": expiryStr})
```

**Template usage:**
- The confirmation link: `<a href="{{.Url}}?token={{.Token}}">Confirm Email Address</a>`
- The token is also shown directly in the email for manual entry.
- The expiry is used in the footer and security notes.

---

**Note:**
- Both templates expect the data as a map with keys `Token`, `Url`, and `Expiry`.
- The token is always the raw (not hashed) value, suitable for user input or direct link usage.
- The URL should be the frontend page that handles the respective action (reset or confirm), without the token query parameter (the template appends it).
