import { createClient } from "@/lib/supabase/server";
import type {
  CreateEventInput,
  Event,
  EventOperationResult,
  EventWithOrganizer,
  GetOrganizerEventsOptions,
  GetPublishedEventsOptions,
  UpdateEventInput,
} from "@/types/event";
import {
  validateCreateEventInput,
  validateUpdateEventInput,
} from "./validation";
import {
  enrichEventWithImageUrl,
  deletePosterFromStorage,
} from "./storage";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

/**
 * Creates a new event for the currently authenticated organizer.
 *
 * Enforces role and ownership through Supabase Row-Level Security (RLS).
 * Only users possessing the 'organizer' or 'admin' role in profiles.roles
 * are permitted to insert rows into public.events.
 */
export async function createEvent(
  input: CreateEventInput
): Promise<EventOperationResult<Event>> {
  // 1. Validate payload
  const validation = validateCreateEventInput(input);
  if (!validation.isValid) {
    return {
      data: null,
      error: {
        message: validation.errorMessage || "Event validation failed.",
        code: "VALIDATION_ERROR",
        fieldErrors: validation.fieldErrors,
      },
    };
  }

  try {
    const supabase = await createClient();

    // 2. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: {
          message: "You must be logged in to create an event.",
          code: "UNAUTHORIZED",
        },
      };
    }

    // 3. Prepare sanitized payload
    const insertPayload = {
      organizer_id: user.id,
      title: input.title.trim(),
      description: (input.description || "").trim(),
      category: input.category.trim(),
      event_type: input.event_type,
      location: input.location?.trim() || null,
      online_meeting_url: input.online_meeting_url?.trim() || null,
      start_at: input.start_at,
      end_at: input.end_at,
      registration_type: input.registration_type || "internal",
      registration_url: input.registration_url?.trim() || null,
      capacity: input.capacity ?? null,
      status: input.status || "draft",
      image_path: input.image_path?.trim() || null,
    };

    // 4. Insert row (RLS policy enforces organizer/admin role and ownership)
    const { data, error } = await supabase
      .from("events")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      if (error.code === "42501") {
        return {
          data: null,
          error: {
            message:
              "Permission denied. Only approved organizers or administrators can create events.",
            code: "FORBIDDEN",
          },
        };
      }

      return {
        data: null,
        error: {
          message: error.message || "Failed to create event.",
          code: error.code,
        },
      };
    }

    return {
      data: enrichEventWithImageUrl(data as Event),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while creating the event.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}

/**
 * Fetches published events for public discovery.
 *
 * Open to both unauthenticated and authenticated users.
 * Supports filtering by category, event_type, search query, upcoming only,
 * and pagination.
 *
 * Organizer information is retrieved strictly from the secure public_organizers
 * view (exposing ONLY id and full_name). Private profile columns and roles are never queried.
 */
export async function getPublishedEvents(
  options?: GetPublishedEventsOptions
): Promise<EventOperationResult<EventWithOrganizer[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("events")
      .select("*")
      .eq("status", "published");

    // Optional category filter
    if (options?.category && options.category.trim()) {
      query = query.eq("category", options.category.trim());
    }

    // Optional event type filter
    if (options?.eventType) {
      query = query.eq("event_type", options.eventType);
    }

    // Optional upcoming only filter
    if (options?.upcomingOnly) {
      query = query.gte("start_at", new Date().toISOString());
    }

    // Optional search across title and description
    if (options?.search && options.search.trim()) {
      const sanitized = options.search.replace(/[%,()]/g, "").trim();
      if (sanitized) {
        query = query.or(
          `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`
        );
      }
    }

    // Default sorting: upcoming start date first
    query = query.order("start_at", { ascending: true });

    // Pagination
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);
    const offset = Math.max(options?.offset ?? 0, 0);
    query = query.range(offset, offset + limit - 1);

    const { data: eventsData, error: eventsError } = await query;

    if (eventsError) {
      return {
        data: null,
        error: {
          message: eventsError.message || "Failed to fetch published events.",
          code: eventsError.code,
        },
      };
    }

    const eventsList = (eventsData || []) as Event[];

    if (eventsList.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    // Retrieve public organizer details from the secure public_organizers view
    const organizerIds = Array.from(
      new Set(eventsList.map((e) => e.organizer_id).filter(Boolean))
    );

    let organizerMap = new Map<string, { id: string; full_name: string }>();

    if (organizerIds.length > 0) {
      const { data: organizersData } = await supabase
        .from("public_organizers")
        .select("id, full_name")
        .in("id", organizerIds);

      if (organizersData) {
        organizerMap = new Map(
          organizersData.map((o) => [
            o.id,
            { id: o.id, full_name: o.full_name },
          ])
        );
      }
    }

    const eventsWithOrganizer: EventWithOrganizer[] = eventsList.map((e) => ({
      ...enrichEventWithImageUrl(e),
      organizer: organizerMap.get(e.organizer_id) ?? null,
    }));

    return {
      data: eventsWithOrganizer,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while fetching events.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}

/**
 * Fetches events created by the currently authenticated organizer.
 *
 * Includes drafts, published, completed, and cancelled events owned by the user.
 */
export async function getOrganizerEvents(
  options?: GetOrganizerEventsOptions
): Promise<EventOperationResult<Event[]>> {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: {
          message: "You must be logged in to view your events.",
          code: "UNAUTHORIZED",
        },
      };
    }

    let query = supabase
      .from("events")
      .select("*")
      .eq("organizer_id", user.id);

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    query = query.order("created_at", { ascending: false });

    if (options?.limit !== undefined || options?.offset !== undefined) {
      const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
      const offset = Math.max(options.offset ?? 0, 0);
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      return {
        data: null,
        error: {
          message: error.message || "Failed to fetch organizer events.",
          code: error.code,
        },
      };
    }

    return {
      data: ((data || []) as Event[]).map((e) => enrichEventWithImageUrl(e)),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while fetching your events.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}

/**
 * Fetches single event details by UUID.
 *
 * Returns published events for any visitor, or private/draft events if the
 * authenticated caller is the event organizer or an admin (enforced via RLS).
 *
 * Organizer details are retrieved strictly through the secure public_organizers view.
 */
export async function getEventById(
  id: string
): Promise<EventOperationResult<EventWithOrganizer>> {
  if (!isValidUuid(id)) {
    return {
      data: null,
      error: {
        message: "Invalid event ID format.",
        code: "INVALID_ID",
      },
    };
  }

  try {
    const supabase = await createClient();

    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id.trim())
      .maybeSingle();

    if (eventError) {
      return {
        data: null,
        error: {
          message: eventError.message || "Failed to fetch event.",
          code: eventError.code,
        },
      };
    }

    if (!eventData) {
      return {
        data: null,
        error: {
          message: "Event not found or access is restricted.",
          code: "NOT_FOUND",
        },
      };
    }

    const event = eventData as Event;

    // Fetch public organizer details from secure view
    let organizer: { id: string; full_name: string } | null = null;
    if (event.organizer_id) {
      const { data: orgData } = await supabase
        .from("public_organizers")
        .select("id, full_name")
        .eq("id", event.organizer_id)
        .maybeSingle();

      if (orgData) {
        organizer = {
          id: orgData.id,
          full_name: orgData.full_name,
        };
      }
    }

    return {
      data: {
        ...enrichEventWithImageUrl(event),
        organizer,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while fetching event details.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}

/**
 * Updates an existing event.
 *
 * Enforces ownership and active organizer/admin status via Supabase RLS policies.
 * Accurately detects zero-row updates (e.g. non-existent event or unauthorized caller)
 * and returns a clear NOT_FOUND_OR_FORBIDDEN error.
 */
export async function updateEvent(
  id: string,
  input: UpdateEventInput
): Promise<EventOperationResult<Event>> {
  if (!isValidUuid(id)) {
    return {
      data: null,
      error: {
        message: "Invalid event ID format.",
        code: "INVALID_ID",
      },
    };
  }

  const validation = validateUpdateEventInput(input);
  if (!validation.isValid) {
    return {
      data: null,
      error: {
        message: validation.errorMessage || "Event update validation failed.",
        code: "VALIDATION_ERROR",
        fieldErrors: validation.fieldErrors,
      },
    };
  }

  // Construct filtered update payload
  const updatePayload: Record<string, unknown> = {};
  if (input.title !== undefined) updatePayload.title = input.title.trim();
  if (input.description !== undefined)
    updatePayload.description = input.description.trim();
  if (input.category !== undefined)
    updatePayload.category = input.category.trim();
  if (input.event_type !== undefined)
    updatePayload.event_type = input.event_type;
  if (input.location !== undefined)
    updatePayload.location = input.location?.trim() || null;
  if (input.online_meeting_url !== undefined)
    updatePayload.online_meeting_url = input.online_meeting_url?.trim() || null;
  if (input.start_at !== undefined) updatePayload.start_at = input.start_at;
  if (input.end_at !== undefined) updatePayload.end_at = input.end_at;
  if (input.registration_type !== undefined)
    updatePayload.registration_type = input.registration_type;
  if (input.registration_url !== undefined)
    updatePayload.registration_url = input.registration_url?.trim() || null;
  if (input.capacity !== undefined) updatePayload.capacity = input.capacity;
  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.image_path !== undefined)
    updatePayload.image_path = input.image_path?.trim() || null;

  if (Object.keys(updatePayload).length === 0) {
    return {
      data: null,
      error: {
        message: "No fields provided to update.",
        code: "BAD_REQUEST",
      },
    };
  }

  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: {
          message: "You must be logged in to update an event.",
          code: "UNAUTHORIZED",
        },
      };
    }

    // Check existing image path if updating poster to clean up replaced file
    let previousImagePath: string | null = null;
    if (input.image_path !== undefined) {
      const { data: existingEvent } = await supabase
        .from("events")
        .select("image_path")
        .eq("id", id.trim())
        .maybeSingle();
      previousImagePath = existingEvent?.image_path || null;
    }

    const { data, error } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", id.trim())
      .select()
      .maybeSingle();

    if (error) {
      return {
        data: null,
        error: {
          message:
            error.code === "42501"
              ? "Permission denied. You do not have permission to modify this event."
              : error.message || "Failed to update event.",
          code: error.code === "42501" ? "FORBIDDEN" : error.code,
        },
      };
    }

    // Explicitly detect zero-row update: event does not exist or caller is unauthorized under RLS USING clause
    if (!data) {
      return {
        data: null,
        error: {
          message:
            "Event not found or you do not have permission to modify it.",
          code: "NOT_FOUND_OR_FORBIDDEN",
        },
      };
    }

    // Clean up replaced poster file if new path is different
    if (
      previousImagePath &&
      previousImagePath !== (updatePayload.image_path ?? null)
    ) {
      await deletePosterFromStorage(supabase, previousImagePath);
    }

    return {
      data: enrichEventWithImageUrl(data as Event),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while updating the event.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}

/**
 * Deletes an event by UUID.
 *
 * Enforces ownership and active organizer/admin status via Supabase RLS policies.
 * Accurately distinguishes successful deletions from zero-row affected attempts.
 */
export async function deleteEvent(
  id: string
): Promise<EventOperationResult<boolean>> {
  if (!isValidUuid(id)) {
    return {
      data: null,
      error: {
        message: "Invalid event ID format.",
        code: "INVALID_ID",
      },
    };
  }

  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: {
          message: "You must be logged in to delete an event.",
          code: "UNAUTHORIZED",
        },
      };
    }

    // Query event first to retrieve image_path for storage cleanup
    const { data: eventToDelete } = await supabase
      .from("events")
      .select("image_path")
      .eq("id", id.trim())
      .maybeSingle();

    const { error, count } = await supabase
      .from("events")
      .delete({ count: "exact" })
      .eq("id", id.trim());

    if (error) {
      return {
        data: null,
        error: {
          message:
            error.code === "42501"
              ? "Permission denied. You do not have permission to delete this event."
              : error.message || "Failed to delete event.",
          code: error.code === "42501" ? "FORBIDDEN" : error.code,
        },
      };
    }

    // Accurately detect zero rows affected (event does not exist or caller unauthorized under RLS)
    if (!count || count === 0) {
      return {
        data: null,
        error: {
          message:
            "Event not found or you do not have permission to delete it.",
          code: "NOT_FOUND_OR_FORBIDDEN",
        },
      };
    }

    // If deletion succeeded and event had a poster, clean it up from storage
    if (eventToDelete?.image_path) {
      await deletePosterFromStorage(supabase, eventToDelete.image_path);
    }

    return {
      data: true,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while deleting the event.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
