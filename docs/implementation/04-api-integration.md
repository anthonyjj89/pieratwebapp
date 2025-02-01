# API Integration Guide

## Overview
This guide details the integration between the web app and Discord bot, including shared types, API endpoints, and real-time updates.

## Prerequisites
- Authentication system from [01-auth-setup.md](./01-auth-setup.md)
- Organization system from [02-org-system.md](./02-org-system.md)
- Dashboard features from [03-dashboard.md](./03-dashboard.md)

## Steps

### 1. Shared Type Definitions
Create `src/types/shared.ts`:
```typescript
// Organization Types
export interface Organization {
  id: string;
  name: string;
  discordServerId: string;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  allowJoinRequests: boolean;
  autoApproveMembers: boolean;
  defaultRole: string;
}

// Report Types
export interface Report {
  id: string;
  organizationId: string;
  status: ReportStatus;
  target: Target;
  crew: CrewMember[];
  loot: LootItem[];
  evidence: Evidence[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = 'draft' | 'submitted' | 'verified' | 'completed';

export interface Target {
  name: string;
  ship: string;
  location: string;
}

export interface CrewMember {
  userId: string;
  role: string;
  share: number;
}

export interface LootItem {
  type: string;
  amount: number;
  value: number;
}

export interface Evidence {
  type: 'image' | 'video';
  url: string;
  description: string;
}

// Event Types
export type WebhookEvent = 
  | ReportCreatedEvent
  | ReportUpdatedEvent
  | MemberJoinedEvent;

export interface ReportCreatedEvent {
  type: 'report.created';
  organizationId: string;
  report: Report;
}

export interface ReportUpdatedEvent {
  type: 'report.updated';
  organizationId: string;
  report: Report;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface MemberJoinedEvent {
  type: 'member.joined';
  organizationId: string;
  userId: string;
  roles: string[];
}
```

### 2. API Routes
Create `src/app/api/v1/organizations/[id]/webhook/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { WebhookEvent } from '@/types/shared';
import { verifySignature } from '@/lib/discord';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const signature = req.headers.get('X-Discord-Signature');
  const timestamp = req.headers.get('X-Discord-Timestamp');
  const body = await req.text();

  // Verify webhook signature
  if (!verifySignature(body, signature, timestamp)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body) as WebhookEvent;

  // Handle different event types
  switch (event.type) {
    case 'report.created':
      await handleReportCreated(event);
      break;
    case 'report.updated':
      await handleReportUpdated(event);
      break;
    case 'member.joined':
      await handleMemberJoined(event);
      break;
    default:
      return new Response('Unknown event type', { status: 400 });
  }

  return new Response(null, { status: 204 });
}
```

### 3. Discord Bot Integration
Create `src/lib/discord.ts`:
```typescript
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.DISCORD_WEBHOOK_SECRET!;

export function verifySignature(
  body: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  if (!signature || !timestamp) return false;

  const message = timestamp + body;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(message)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function notifyDiscordBot(
  organizationId: string,
  event: string,
  data: any
) {
  const response = await fetch(
    `${process.env.DISCORD_BOT_URL}/api/organizations/${organizationId}/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DISCORD_BOT_API_KEY}`,
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to notify Discord bot');
  }
}
```

### 4. Real-time Updates
Create `src/app/api/v1/organizations/[id]/events/route.ts`:
```typescript
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const headersList = headers();
  
  // Set up SSE headers
  const response = new NextResponse(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Keep connection alive
        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        }, 30000);

        // Handle client disconnect
        headersList.get('connection')?.addEventListener('close', () => {
          clearInterval(keepAlive);
          controller.close();
        });

        // Subscribe to organization events
        const unsubscribe = subscribeToEvents(params.id, (event) => {
          const data = encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
          controller.enqueue(data);
        });

        // Cleanup on close
        headersList.get('connection')?.addEventListener('close', unsubscribe);
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );

  return response;
}
```

### 5. Event Subscription
Create `src/lib/events.ts`:
```typescript
import { WebhookEvent } from '@/types/shared';
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();

export function subscribeToEvents(
  organizationId: string,
  callback: (event: WebhookEvent) => void
): () => void {
  const handler = (event: WebhookEvent) => {
    if (event.organizationId === organizationId) {
      callback(event);
    }
  };

  eventEmitter.on('event', handler);
  return () => eventEmitter.off('event', handler);
}

export function publishEvent(event: WebhookEvent) {
  eventEmitter.emit('event', event);
}
```

### 6. Client-side Event Handling
Create `src/hooks/useOrganizationEvents.ts`:
```typescript
import { useEffect, useState } from 'react';
import { WebhookEvent } from '@/types/shared';

export function useOrganizationEvents(organizationId: string) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/v1/organizations/${organizationId}/events`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebhookEvent;
      setEvents((prev) => [...prev, data]);
    };

    return () => {
      eventSource.close();
    };
  }, [organizationId]);

  return events;
}
```

### 7. Environment Variables
Add to `.env.local`:
```env
# Discord Bot Integration
DISCORD_BOT_URL=http://localhost:3001
DISCORD_BOT_API_KEY=your-api-key
DISCORD_WEBHOOK_SECRET=your-webhook-secret
```

### 8. Testing
1. Test webhook verification:
   ```bash
   # Generate test signature
   timestamp=$(date +%s)
   body='{"type":"report.created","data":{}}'
   signature=$(echo -n "$timestamp$body" | openssl sha256 -hmac "your-webhook-secret" -hex)
   
   # Send test webhook
   curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-Discord-Signature: $signature" \
     -H "X-Discord-Timestamp: $timestamp" \
     -d "$body" \
     http://localhost:3000/api/v1/organizations/123/webhook
   ```

2. Test real-time updates:
   - Open multiple browser tabs
   - Create/update reports
   - Verify events propagate
   - Check reconnection behavior

### Next Steps
1. Add retry logic for failed notifications
2. Implement event persistence
3. Add webhook configuration UI
4. Set up monitoring and logging
5. Add rate limiting
