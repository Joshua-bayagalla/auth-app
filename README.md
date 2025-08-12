# Authentication App with Email Verification

A complete authentication system built with React, Node.js, and email verification functionality.

## Features

- ✅ User registration with email verification
- ✅ Secure login system
- ✅ Email verification via email links
- ✅ Protected routes
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive design
- ✅ Token-based verification with expiration

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Nodemailer
- **Email**: Gmail SMTP (configurable for other providers)
- **Authentication**: Custom JWT-like tokens with expiration

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd auth-app
npm install
```

### 2. Email Configuration

#### Option A: Gmail (Recommended for testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Create `.env` file** in the root directory:

```bash
cp env.example .env
```

4. **Edit `.env` file** with your credentials:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
PORT=3001
FRONTEND_URL=http://localhost:5173
```

#### Option B: Other Email Providers

Update the `transporter` configuration in `server.js`:

```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook', // or 'yahoo', 'hotmail', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### 3. Start the Application

#### Development Mode (Frontend + Backend)
```bash
npm run dev:full
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

#### Separate Mode
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

### 4. Build for Production
```bash
npm run build
npm run server
```

## How It Works

### 1. User Registration
1. User fills out signup form
2. Backend creates user account (unverified)
3. Verification email sent with secure token
4. Token expires in 24 hours

### 2. Email Verification
1. User clicks verification link in email
2. Frontend calls backend verification API
3. Backend validates token and marks user as verified
4. User redirected to login page

### 3. User Login
1. User enters credentials
2. Backend checks if email is verified
3. If verified, user logs in successfully
4. If not verified, user gets verification reminder

### 4. Resend Verification
1. User can request new verification email
2. New token generated and sent
3. Old tokens become invalid

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `POST /api/verify-email` - Email verification
- `POST /api/resend-verification` - Resend verification email

### Response Format
```json
{
  "message": "Success message",
  "user": {
    "email": "user@example.com",
    "verified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

- **Token Expiration**: Verification tokens expire after 24 hours
- **Secure Tokens**: 32-byte random hex tokens
- **Email Validation**: Prevents login without verification
- **CORS Protection**: Configured for development and production
- **Input Validation**: Server-side validation for all inputs

## Production Considerations

### Database
- Replace in-memory storage with proper database (MongoDB, PostgreSQL)
- Implement proper password hashing (bcrypt)
- Add user roles and permissions

### Security
- Use HTTPS in production
- Implement rate limiting
- Add request validation middleware
- Use environment variables for all secrets

### Email
- Use professional email service (SendGrid, AWS SES)
- Implement email templates
- Add email delivery tracking

### Authentication
- Implement JWT tokens
- Add refresh token mechanism
- Implement password reset functionality

## Troubleshooting

### Email Not Sending
1. Check your email credentials in `.env`
2. Verify 2FA is enabled (for Gmail)
3. Check app password is correct
4. Check firewall/antivirus settings

### Verification Link Not Working
1. Ensure backend server is running
2. Check token expiration (24 hours)
3. Verify email matches token
4. Check browser console for errors

### Port Conflicts
1. Change `PORT` in `.env` file
2. Update `FRONTEND_URL` accordingly
3. Restart both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code comments
3. Open an issue on GitHub
4. Check the console logs for errors
