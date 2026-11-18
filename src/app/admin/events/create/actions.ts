"use server";

import { createEvent, updateEvent } from "@/lib/events";
import {
  uploadPosterToStorage,
  deletePosterFromStorage,
  validatePosterFile,
} from "@/lib/events/storage";
import {
  CreateEventInput,
  UpdateEventInput,
  EventOperationResult,
  Event,
} from "@/types/event";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action for creating an event.
 * Proxies to createEvent() from src/lib/events/operations.ts,
 * which enforces server-side authentication, role authorization,
 * input validation, and database constraints.
 */
export async function createEventAction(
  input: CreateEventInput
): Promise<EventOperationResult<Event>> {
  const result = await createEvent(input);

  if (result.data) {
    // Revalidate dashboard and discovery pages so fresh records appear immediately
    revalidatePath("/admin/dashboard");
    revalidatePath("/explore");
  }

  return result;
}

/**
 * Server Action for updating an existing event.
 * Proxies to updateEvent() with ownership enforcement and cache revalidation.
 */
export async function updateEventAction(
  id: string,
  input: UpdateEventInput
): Promise<EventOperationResult<Event>> {
  const result = await updateEvent(id, input);

  if (result.data) {
    revalidatePath("/admin/dashboard");
    revalidatePath("/explore");
    revalidatePath(`/admin/events/${id}/edit`);
  }

  return result;
}

/**
 * Server Action for uploading an event poster to Supabase Storage.
 * Restricts upload to authenticated organizers/admins and stores within their scoped directory.
 */
export async function uploadPosterAction(
  formData: FormData
): Promise<{
  data: { path: string; publicUrl: string } | null;
  error: string | null;
}> {
  const file = formData.get("file") as File | null;
  if (!file) {
    return { data: null, error: "No image file provided." };
  }

  const validation = validatePosterFile(file);
  if (!validation.isValid) {
    return { data: null, error: validation.error || "Invalid poster file." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: "You must be logged in to upload an event poster.",
      };
    }

    const eventId = formData.get("eventId") as string | null;
    return await uploadPosterToStorage(
      supabase,
      file,
      user.id,
      eventId || undefined
    );
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload poster image.",
    };
  }
}

/**
 * Server Action for deleting a poster image from Supabase Storage.
 */
export async function deletePosterAction(
  imagePath: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized." };
    }

    return await deletePosterFromStorage(supabase, imagePath);
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to delete poster image.",
    };
  }
}
