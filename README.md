# PieRat WebApp

Multi-tenant web platform for Star Citizen piracy management.

## Setup

1. Clone the repository
```bash
git clone https://github.com/anthonyjj89/pieratwebapp.git
cd pieratwebapp
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
- Copy `.env.example` to `.env.local`
- Fill in the required environment variables:
  - MongoDB connection details
  - Discord OAuth credentials
  - NextAuth configuration

4. Generate NextAuth secret
```bash
openssl rand -base64 32
```
Add the generated secret to your `.env.local` as `NEXTAUTH_SECRET`

5. Run development server
```bash
npm run dev
```

## Environment Variables

### Required Variables
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: MongoDB database name
- `DISCORD_CLIENT_ID`: Discord OAuth client ID
- `DISCORD_CLIENT_SECRET`: Discord OAuth client secret
- `NEXTAUTH_URL`: Full URL of your application
- `NEXTAUTH_SECRET`: Random string for session encryption

### Production Variables
- `VERCEL_URL`: Automatically set by Vercel
- `VERCEL_ENV`: Automatically set by Vercel

## Features

- Multi-tenant Organization System
- Discord Authentication
- Hit Reporting System
- Crew Management
- Profit Sharing
- Payment Tracking

## Development Guidelines

1. Security First
   - Proper data isolation
   - Role-based access
   - Input validation
   - API security

2. User Experience
   - Mobile-friendly design
   - Clear navigation
   - Intuitive workflows
   - Responsive interface

3. Development Process
   - Test thoroughly
   - Document changes
   - Regular backups
   - Performance monitoring

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- MongoDB
- NextAuth.js
- Discord OAuth

## Deployment

This application is configured for deployment on Vercel:

1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## License

Private repository - All rights reserved
