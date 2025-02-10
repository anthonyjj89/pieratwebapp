# System Patterns

## Database Structure

### Collections
- organizations: Main collection for organization data
  - Indexes:
    - discordGuildId (unique)
    - ownerId
    - createdAt (-1)
    - updatedAt (-1)
    - members.discordUserId
  - Schema includes:
    - members array
    - roles map
    - settings with profitSharing configuration

- organizationmembers: Collection for organization membership
  - Indexes:
    - {organizationId, discordUserId} (unique compound)
    - joinedAt (-1)

- organizationinvites: Collection for organization invites
  - Indexes:
    - code (unique)
    - organizationId
    - expiresAt
    - isActive
    - createdAt (-1)

- joinrequests: Collection for organization join requests
  - Indexes:
    - {organizationId, discordUserId, status} (compound)
    - status
    - createdAt (-1)

## Database Management
- Database setup script: `scripts/setup-db.cjs`
  - Creates collections if they don't exist
  - Sets up all required indexes
  - Ensures existing documents have required fields with defaults
  - Can be used to initialize new database instances

## Authentication
- Using NextAuth.js with Discord provider
- Custom MongoDB adapter for user data storage
- JWT strategy for session management
- Scopes: identify, email, guilds, guilds.members.read

## API Structure
- RESTful API endpoints under src/app/api/
- Protected routes using NextAuth.js middleware
- Organization-scoped endpoints under /api/organizations/
- Trade and player data endpoints for game integration
