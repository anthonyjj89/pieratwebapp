# PieRat Web App Roadmap

## Overview
PieRat is a multi-tenant web platform for Star Citizen piracy management, working in conjunction with a Discord bot for seamless integration.

## Milestones

### 1. Authentication & Authorization
- [x] Basic Next.js setup
- [ ] NextAuth integration with Discord
- [ ] Protected routes
- [ ] Admin permission verification
- [ ] Session management

### 2. Organization System
- [ ] Organization creation (Discord server admins only)
  - [ ] Link Discord server to organization
  - [ ] Set up organization settings
  - [ ] Configure roles and permissions
- [ ] Member management
  - [ ] Join requests
  - [ ] Admin approval system
  - [ ] Member roles and permissions

### 3. Dashboard & Core Features
- [ ] Dashboard layout
  - [ ] Responsive sidebar
  - [ ] Navigation system
  - [ ] User profile
- [ ] Hit reporting
  - [ ] Create/edit reports
  - [ ] Status tracking
  - [ ] Evidence attachments
- [ ] Crew management
  - [ ] Member profiles
  - [ ] Activity tracking
  - [ ] Performance metrics
- [ ] Profit tracking
  - [ ] Revenue recording
  - [ ] Profit sharing calculations
  - [ ] Payout tracking

### 4. API Integration
- [ ] Discord bot integration
  - [ ] Shared type definitions
  - [ ] API endpoints
  - [ ] Webhook handlers
- [ ] Real-time updates
  - [ ] WebSocket connections
  - [ ] Event handling
  - [ ] Notifications

## Implementation Details
Detailed implementation guides for each milestone can be found in the `/docs/implementation` directory:
- [Auth Setup](./implementation/01-auth-setup.md)
- [Organization System](./implementation/02-org-system.md)
- [Dashboard & Features](./implementation/03-dashboard.md)
- [API Integration](./implementation/04-api-integration.md)
