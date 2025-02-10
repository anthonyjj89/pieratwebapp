# Project Handover Documentation

## Project Overview
PieRat is a multi-tenant web platform for Star Citizen piracy management, built with Next.js and integrated with Discord for user authentication. The platform enables organizations to manage members, track hits, calculate profit sharing based on roles, and view analytics.

## Project Structure

### Core Technologies
- Next.js 14+ with App Router
- TypeScript
- MongoDB for data storage
- Discord OAuth for authentication
- Server-sent events for real-time updates
- Tailwind CSS for styling

### Directory Structure
```
pieratwebapp/
├── docs/                    # Documentation
├── public/                  # Static assets
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── (auth)/        # Authentication routes
│   │   ├── (dashboard)/   # Dashboard routes
│   │   ├── api/           # API routes
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── models/           # MongoDB models
│   ├── services/         # External service integrations
│   └── types/            # TypeScript type definitions
└── scripts/              # Utility scripts
```

## Key Features

### 1. Authentication System
- Discord OAuth integration
- Protected routes with session management
- Discord server permission verification (if possible)
- Role-based access control

### 2. Organization System
- Organization creation for Discord server admins
- Member management with roles and permissions
- Join request system with admin approval
- Analytics and role-based profit tracking

### 3. Dashboard Features
- Responsive layout with navigation
- Hit reporting system
- Crew management
- Analytics dashboard
- Profit sharing calculations

### 4. API Integration
- Discord user authentication
- Real-time updates via SSE
- Webhook system for events
- Shared type definitions

## Recent Changes

### 1. Analytics System
- Added analytics types and interfaces
- Implemented profit sharing calculations
- Created useOrganizationAnalytics hook
- Added real-time analytics updates

### 2. Route Handler Updates
- Updated all dynamic route handlers to use Next.js 14+ patterns
- Added Promise-based params typing
- Improved error handling
- Enhanced type safety

### 3. Documentation Updates
- Updated implementation guides
- Added new analytics documentation
- Updated roadmap with completed features
- Added future enhancements section

## Environment Setup

### Required Environment Variables
```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret

# Database
MONGODB_URI=your-mongodb-uri

# Discord Bot Integration
DISCORD_BOT_URL=http://localhost:3001
DISCORD_BOT_API_KEY=your-api-key
DISCORD_WEBHOOK_SECRET=your-webhook-secret
```

### Development Setup
1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

## Type System

### Organization Types
```typescript
interface Organization {
    _id: ObjectId;
    id: string;
    name: string;
    description?: string;
    discordGuildId: string;
    ownerId: string;
    members: OrganizationMember[];
    settings: {
        profitSharing: {
            defaultShare: number;
            method: 'equal' | 'role' | 'contribution';
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

interface OrganizationMember {
    userId: string;
    discordUserId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    settings?: {
        profitShare?: number;
    };
}
```

### Analytics Types
```typescript
interface AnalyticsData {
    totalMembers: number;
    totalReports: number;
    totalProfit: number;
    profitByMember: Map<string, number>;
}

interface AnalyticsResponse {
    totalMembers: number;
    totalReports: number;
    totalProfit: number;
    profitByMember: MemberProfit[];
}
```

## API Routes

### Organization Routes
- POST /api/organizations - Create organization
- GET /api/organizations/current - Get current organization
- GET /api/organizations/[id]/analytics - Get organization analytics
- POST /api/organizations/[id]/join - Submit join request
- GET /api/organizations/[id]/members - List organization members

### Report Routes
- POST /api/reports - Create report
- GET /api/reports/[id] - Get report details
- DELETE /api/reports/[id] - Delete report
- GET /api/organizations/[id]/reports - List organization reports

### Webhook Routes
- POST /api/v1/organizations/[id]/webhook - Handle Discord bot webhooks
- GET /api/v1/organizations/[id]/events - SSE endpoint for real-time updates

## Custom Hooks

### useOrganizationAnalytics
```typescript
function useOrganizationAnalytics(organizationId: string | null): {
    analytics: AnalyticsResponse | null;
    isLoading: boolean;
    error: string | null;
    mutate: () => Promise<void>;
}
```

### useCurrentOrganization
```typescript
function useCurrentOrganization(): {
    organization: Organization | null;
    isLoading: boolean;
    error: string | null;
}
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test

# Run with coverage
npm test -- --coverage
```

### Test Structure
- Unit tests in `__tests__` directories
- Integration tests in `cypress/integration`
- API tests in `__tests__/api`

## Deployment

### Production Build
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

### Environment Considerations
- Set NODE_ENV to 'production'
- Configure proper CORS settings
- Set up MongoDB indexes
- Configure rate limiting

## Known Issues & TODOs

### Current Issues
1. Rate limiting needs implementation
2. File upload size limits need configuration
3. Discord bot notification retries needed

### Planned Features
1. Advanced analytics with historical data
2. Enhanced profit sharing options
3. Real-time chat integration
4. Export functionality

## Important Notes for New Developers

### Route Handler Pattern
All dynamic route handlers must use the Promise-based params pattern:
```typescript
type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(
    request: Request,
    { params }: Props
) {
    const { id } = await params;
    // ... handler implementation
}
```

### Analytics Updates
When modifying reports or member data, remember to:
1. Update analytics calculations
2. Emit analytics.updated event
3. Trigger real-time updates

### Type Safety
- Always use TypeScript interfaces for API responses
- Maintain shared types in src/types directory
- Use strict type checking for MongoDB operations

### Error Handling
- Use consistent error response format
- Log errors with proper context
- Handle edge cases in profit calculations

## Support & Resources

### Documentation
- [Auth Setup](./implementation/01-auth-setup.md)
- [Organization System](./implementation/02-org-system.md)
- [Dashboard Features](./implementation/03-dashboard.md)
- [API Integration](./implementation/04-api-integration.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Discord API Documentation](https://discord.com/developers/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

### Contact
For questions or issues:
1. Check existing documentation
2. Review GitHub issues
3. Contact project maintainers
