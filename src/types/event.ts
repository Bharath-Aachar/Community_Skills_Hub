/**
 * Reusable TypeScript event types matching the Supabase public.events schema.
 * Stage 3, Task 2: Event Management Backend
 */

export type EventType = "online" | "offline" | "hybrid";

export type RegistrationType = "internal" | "external";

export type EventStatus = "draft" | "published" | "completed" | "cancelled";

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  event_type: EventType;
  location: string | null;
  online_meeting_url: string | null;
  start_at: string;
  end_at: string;
  registration_type: RegistrationType;
  registration_url: string | null;
  capacity: number | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * Event with organizer public details attached (for discovery views).
 * Exposes strictly public organizer information (id, full_name).
 * Private account attributes, roles, and timestamps are never exposed.
 */
export interface EventWithOrganizer extends Event {
  organizer?: {
    id: string;
    full_name: string;
  } | null;
}

/**
 * Input payload for creating a new event.
 */
export interface CreateEventInput {
  title: string;
  description?: string;
  category: string;
  event_type: EventType;
  location?: string | null;
  online_meeting_url?: string | null;
  start_at: string;
  end_at: string;
  registration_type?: RegistrationType;
  registration_url?: string | null;
  capacity?: number | null;
  status?: EventStatus;
}

/**
 * Input payload for updating an existing event.
 */
export interface UpdateEventInput {
  title?: string;
  description?: string;
  category?: string;
  event_type?: EventType;
  location?: string | null;
  online_meeting_url?: string | null;
  start_at?: string;
  end_at?: string;
  registration_type?: RegistrationType;
  registration_url?: string | null;
  capacity?: number | null;
  status?: EventStatus;
}

/**
 * Query options for fetching public/published events.
 */
export interface GetPublishedEventsOptions {
  category?: string;
  eventType?: EventType;
  search?: string;
  upcomingOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Query options for an organizer viewing their own events.
 */
export interface GetOrganizerEventsOptions {
  status?: EventStatus;
  limit?: number;
  offset?: number;
}

/**
 * Standard operation response with clear error structure.
 */
export interface EventOperationResult<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    fieldErrors?: Record<string, string>;
  } | null;
}
