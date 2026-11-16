import type {
  CreateEventInput,
  UpdateEventInput,
  EventType,
  RegistrationType,
  EventStatus,
} from "@/types/event";

export interface ValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  errorMessage?: string;
}

const VALID_EVENT_TYPES: EventType[] = ["online", "offline", "hybrid"];
const VALID_REGISTRATION_TYPES: RegistrationType[] = ["internal", "external"];
const VALID_STATUSES: EventStatus[] = ["draft", "published", "completed", "cancelled"];

/**
 * Validates whether a string is a well-formed HTTP or HTTPS URL.
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates whether a string is a valid ISO timestamp.
 */
export function isValidIsoDate(dateString: string | null | undefined): boolean {
  if (!dateString || typeof dateString !== "string") return false;
  const timestamp = Date.parse(dateString);
  return !Number.isNaN(timestamp);
}

/**
 * Comprehensive input validator for event creation.
 */
export function validateCreateEventInput(input: CreateEventInput): ValidationResult {
  const fieldErrors: Record<string, string> = {};

  // 1. Title validation
  if (!input.title || typeof input.title !== "string" || input.title.trim().length < 3) {
    fieldErrors.title = "Event title is required and must be at least 3 characters long.";
  } else if (input.title.trim().length > 200) {
    fieldErrors.title = "Event title cannot exceed 200 characters.";
  }

  // 2. Category validation
  if (!input.category || typeof input.category !== "string" || input.category.trim().length < 2) {
    fieldErrors.category = "Category is required and must be at least 2 characters long.";
  } else if (input.category.trim().length > 60) {
    fieldErrors.category = "Category cannot exceed 60 characters.";
  }

  // 3. Event Type validation
  if (!input.event_type || !VALID_EVENT_TYPES.includes(input.event_type)) {
    fieldErrors.event_type = "Event type must be 'online', 'offline', or 'hybrid'.";
  }

  // 4. Dates validation
  const hasValidStart = isValidIsoDate(input.start_at);
  const hasValidEnd = isValidIsoDate(input.end_at);

  if (!hasValidStart) {
    fieldErrors.start_at = "A valid start date and time is required.";
  }

  if (!hasValidEnd) {
    fieldErrors.end_at = "A valid end date and time is required.";
  }

  if (hasValidStart && hasValidEnd) {
    const startDate = new Date(input.start_at);
    const endDate = new Date(input.end_at);

    if (endDate <= startDate) {
      fieldErrors.end_at = "Event end date must be strictly after the start date.";
    }
  }

  // 5. Venue / Location and Meeting URL validation
  if (input.event_type === "offline") {
    if (!input.location || input.location.trim().length < 2) {
      fieldErrors.location = "Physical venue location is required for in-person events.";
    }
  } else if (input.event_type === "online") {
    if (input.online_meeting_url && !isValidUrl(input.online_meeting_url)) {
      fieldErrors.online_meeting_url = "Please enter a valid HTTP/HTTPS online meeting URL.";
    }
  } else if (input.event_type === "hybrid") {
    if (!input.location && !input.online_meeting_url) {
      fieldErrors.location = "Hybrid events must specify at least a venue location or meeting URL.";
    }
    if (input.online_meeting_url && !isValidUrl(input.online_meeting_url)) {
      fieldErrors.online_meeting_url = "Please enter a valid HTTP/HTTPS online meeting URL.";
    }
  }

  // 6. Registration Type & URL validation
  const regType = input.registration_type || "internal";
  if (!VALID_REGISTRATION_TYPES.includes(regType)) {
    fieldErrors.registration_type = "Registration type must be 'internal' or 'external'.";
  }

  if (regType === "external") {
    if (!input.registration_url || !input.registration_url.trim()) {
      fieldErrors.registration_url = "Registration URL is required for external registrations.";
    } else if (!isValidUrl(input.registration_url)) {
      fieldErrors.registration_url = "Please enter a valid HTTP/HTTPS registration URL.";
    }
  }

  // 7. Capacity validation
  if (input.capacity !== undefined && input.capacity !== null) {
    if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
      fieldErrors.capacity = "Event capacity must be a positive whole number.";
    }
  }

  // 8. Status validation
  if (input.status && !VALID_STATUSES.includes(input.status)) {
    fieldErrors.status = "Status must be 'draft', 'published', 'completed', or 'cancelled'.";
  }

  const isValid = Object.keys(fieldErrors).length === 0;

  return {
    isValid,
    fieldErrors,
    errorMessage: isValid
      ? undefined
      : Object.values(fieldErrors)[0] || "Invalid event input payload.",
  };
}

/**
 * Validates an update payload for an existing event.
 */
export function validateUpdateEventInput(input: UpdateEventInput): ValidationResult {
  const fieldErrors: Record<string, string> = {};

  if (input.title !== undefined) {
    if (typeof input.title !== "string" || input.title.trim().length < 3) {
      fieldErrors.title = "Event title must be at least 3 characters long.";
    } else if (input.title.trim().length > 200) {
      fieldErrors.title = "Event title cannot exceed 200 characters.";
    }
  }

  if (input.category !== undefined) {
    if (typeof input.category !== "string" || input.category.trim().length < 2) {
      fieldErrors.category = "Category must be at least 2 characters long.";
    } else if (input.category.trim().length > 60) {
      fieldErrors.category = "Category cannot exceed 60 characters.";
    }
  }

  if (input.event_type !== undefined && !VALID_EVENT_TYPES.includes(input.event_type)) {
    fieldErrors.event_type = "Event type must be 'online', 'offline', or 'hybrid'.";
  }

  if (input.start_at !== undefined && !isValidIsoDate(input.start_at)) {
    fieldErrors.start_at = "Start date must be a valid ISO date timestamp.";
  }

  if (input.end_at !== undefined && !isValidIsoDate(input.end_at)) {
    fieldErrors.end_at = "End date must be a valid ISO date timestamp.";
  }

  if (input.start_at && input.end_at && isValidIsoDate(input.start_at) && isValidIsoDate(input.end_at)) {
    if (new Date(input.end_at) <= new Date(input.start_at)) {
      fieldErrors.end_at = "Event end date must be strictly after the start date.";
    }
  }

  if (input.location !== undefined && input.location !== null) {
    if (typeof input.location !== "string" || (input.event_type === "offline" && input.location.trim().length < 2)) {
      fieldErrors.location = "Physical venue location is required for in-person events.";
    }
  }

  if (input.online_meeting_url && !isValidUrl(input.online_meeting_url)) {
    fieldErrors.online_meeting_url = "Please enter a valid HTTP/HTTPS meeting URL.";
  }

  if (input.registration_type !== undefined && !VALID_REGISTRATION_TYPES.includes(input.registration_type)) {
    fieldErrors.registration_type = "Registration type must be 'internal' or 'external'.";
  }

  if (input.registration_type === "external") {
    if (input.registration_url !== undefined && (!input.registration_url || !isValidUrl(input.registration_url))) {
      fieldErrors.registration_url = "A valid HTTP/HTTPS registration URL is required for external registrations.";
    }
  } else if (input.registration_url && !isValidUrl(input.registration_url)) {
    fieldErrors.registration_url = "Please enter a valid HTTP/HTTPS registration URL.";
  }

  if (input.capacity !== undefined && input.capacity !== null) {
    if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
      fieldErrors.capacity = "Event capacity must be a positive whole number.";
    }
  }

  if (input.status !== undefined && !VALID_STATUSES.includes(input.status)) {
    fieldErrors.status = "Status must be 'draft', 'published', 'completed', or 'cancelled'.";
  }

  const isValid = Object.keys(fieldErrors).length === 0;

  return {
    isValid,
    fieldErrors,
    errorMessage: isValid
      ? undefined
      : Object.values(fieldErrors)[0] || "Invalid event update payload.",
  };
}
