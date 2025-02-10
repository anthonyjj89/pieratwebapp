# PieRat Web App Roadmap

## Overview
PieRat is a multi-tenant web platform for Star Citizen piracy management, working in conjunction with a Discord bot for seamless integration.

## Milestones

### 1. Authentication & Authorization
- [x] Basic Next.js setup
- [x] NextAuth integration with Discord
- [x] Protected routes
- [x] Admin permission verification
- [x] Session management

### 2. Organization System
- [x] Organization creation (Discord server admins only)
  - [x] Link Discord server to organization
  - [x] Set up organization settings
  - [x] Configure roles and permissions
- [x] Member management
  - [x] Join requests
  - [x] Admin approval system
  - [x] Member roles and permissions
- [x] Analytics system
  - [x] Member statistics
  - [x] Profit tracking
  - [x] Report analytics

### 3. Dashboard & Core Features
- [x] Dashboard layout
  - [x] Responsive sidebar
  - [x] Navigation system
  - [x] User profile
- [x] Hit reporting
  - [x] Create/edit reports
  - [x] Status tracking
  - [x] Evidence attachments
- [x] Crew management
  - [x] Member profiles
  - [x] Activity tracking
  - [x] Performance metrics
- [x] Profit tracking
  - [x] Revenue recording
  - [x] Profit sharing calculations
  - [x] Payout tracking

### 4. API Integration
- [x] Discord bot integration
  - [x] Shared type definitions
  - [x] API endpoints
  - [x] Webhook handlers
- [x] Real-time updates
  - [x] Server-sent events
  - [x] Event handling
  - [x] Analytics updates

### 5. Future Enhancements
- [ ] Advanced Analytics
  - [ ] Historical data trends
  - [ ] Member performance charts
  - [ ] Export functionality
- [ ] Enhanced Profit Sharing
  - [ ] Custom share ratios
  - [ ] Role-based shares
  - [ ] Contribution tracking
- [ ] Real-time Features
  - [ ] Live activity feed
  - [ ] Instant notifications
  - [ ] Chat integration

## Implementation Details
Detailed implementation guides for each milestone can be found in the `/docs/implementation` directory:
- [Auth Setup](./implementation/01-auth-setup.md)
- [Organization System](./implementation/02-org-system.md)
- [Dashboard & Features](./implementation/03-dashboard.md)
- [API Integration](./implementation/04-api-integration.md)
