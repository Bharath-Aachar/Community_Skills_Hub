import { SupabaseClient } from "@supabase/supabase-js";

export const EVENT_POSTERS_BUCKET = "event-posters";
export const MAX_POSTER_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_POSTER_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const ALLOWED_POSTER_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export interface PosterValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a poster file before upload:
 * - Must be JPEG, PNG, or WebP.
 * - Maximum file size 5 MB.
 */
export function validatePosterFile(file: File): PosterValidationResult {
  if (!file) {
    return { isValid: false, error: "No file selected." };
  }

  // Validate MIME type
  const mimeType = file.type?.toLowerCase();
  const fileName = file.name?.toLowerCase() || "";
  const hasValidExt = ALLOWED_POSTER_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!ALLOWED_POSTER_MIME_TYPES.includes(mimeType) && !hasValidExt) {
    return {
      isValid: false,
      error:
        "Invalid file format. Please upload a JPEG, PNG, or WebP image.",
    };
  }

  // Validate size
  if (file.size > MAX_POSTER_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${sizeInMb} MB) exceeds the 5 MB limit. Please choose a smaller image.`,
    };
  }

  return { isValid: true };
}

/**
 * Constructs the public display URL for an event poster stored in Supabase Storage.
 * Does not make network requests; uses the public bucket configuration.
 */
export function getEventPosterPublicUrl(
  imagePath: string | null | undefined
): string | null {
  if (!imagePath || typeof imagePath !== "string" || !imagePath.trim()) {
    return null;
  }

  // If already an absolute HTTP/HTTPS URL, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const cleanPath = imagePath.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${EVENT_POSTERS_BUCKET}/${cleanPath}`;
}

/**
 * Uploads an event poster file to Supabase Storage.
 * Organizes storage paths by organizer ID: <organizer_id>/<timestamp>-<filename>
 */
export async function uploadPosterToStorage(
  supabase: SupabaseClient,
  file: File,
  organizerId: string,
  eventId?: string
): Promise<{
  data: { path: string; publicUrl: string } | null;
  error: string | null;
}> {
  const validation = validatePosterFile(file);
  if (!validation.isValid) {
    return { data: null, error: validation.error || "Invalid poster file." };
  }

  try {
    // Generate clean safe file name
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const safeExt = ALLOWED_POSTER_EXTENSIONS.includes(ext) ? ext : ".png";
    const timestamp = Date.now();
    const eventPrefix = eventId ? `${eventId}-` : "";
    const storagePath = `${organizerId}/${eventPrefix}${timestamp}${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from(EVENT_POSTERS_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/png",
      });

    if (uploadError) {
      return {
        data: null,
        error: uploadError.message || "Failed to upload image to storage.",
      };
    }

    const publicUrl = getEventPosterPublicUrl(storagePath) || "";

    return {
      data: {
        path: storagePath,
        publicUrl,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during poster upload.",
    };
  }
}

/**
 * Deletes an event poster from Supabase Storage.
 * Used for cleaning up replaced images or removing posters to prevent orphaned files.
 */
export async function deletePosterFromStorage(
  supabase: SupabaseClient,
  imagePath: string
): Promise<{ success: boolean; error: string | null }> {
  if (!imagePath || typeof imagePath !== "string" || !imagePath.trim()) {
    return { success: true, error: null };
  }

  // Do not attempt to delete external full URLs
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return { success: true, error: null };
  }

  try {
    const cleanPath = imagePath.replace(/^\/+/, "");
    const { error } = await supabase.storage
      .from(EVENT_POSTERS_BUCKET)
      .remove([cleanPath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to remove poster.",
    };
  }
}

/**
 * Attaches the computed public image_url to an event record.
 */
export function enrichEventWithImageUrl<T extends { image_path?: string | null }>(
  event: T
): T & { image_url: string | null } {
  return {
    ...event,
    image_url: getEventPosterPublicUrl(event.image_path),
  };
}
