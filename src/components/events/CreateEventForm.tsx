"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Laptop,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Ticket,
  ExternalLink,
  Users,
  FileEdit,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Eye,
  Info,
  UploadCloud,
  ImageIcon,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  createEventAction,
  updateEventAction,
  uploadPosterAction,
} from "@/app/admin/events/create/actions";
import {
  EventType,
  RegistrationType,
  EventStatus,
  CreateEventInput,
  UpdateEventInput,
  Event,
} from "@/types/event";
import {
  validateCreateEventInput,
  validateUpdateEventInput,
  isValidUrl,
} from "@/lib/events/validation";
import {
  validatePosterFile,
  getEventPosterPublicUrl,
} from "@/lib/events/storage";
import Logo from "@/components/Logo";

interface CreateEventFormProps {
  userName: string;
  userEmail: string;
  roles: string[];
  initialEvent?: Event;
}

const POPULAR_CATEGORIES = [
  "Technology",
  "Design",
  "Development",
  "Data & AI",
  "Product & Management",
  "Business & Marketing",
  "Creative Arts",
  "Community & Leadership",
];

const SUPPORTED_REGISTRATION_PLATFORMS = [
  "Unstop",
  "Luma",
  "Google Forms",
  "Eventbrite",
  "Meetup",
];

// Helper to convert ISO string to local input datetime string (YYYY-MM-DDTHH:mm)
function toLocalInputDatetime(isoString?: string | null): string {
  if (!isoString) {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);
    return formatForInput(start);
  }
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return formatForInput(date);
  } catch {
    return "";
  }
}

function formatForInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

export default function CreateEventForm({
  userName,
  userEmail,
  initialEvent,
}: CreateEventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialEvent;

  // Form State
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [description, setDescription] = useState(
    initialEvent?.description || ""
  );

  const initialCat = initialEvent?.category || "Technology";
  const isInitialCatCustom = !POPULAR_CATEGORIES.includes(initialCat);
  const [category, setCategory] = useState(
    isInitialCatCustom ? "" : initialCat
  );
  const [customCategory, setCustomCategory] = useState(
    isInitialCatCustom ? initialCat : ""
  );
  const [isCustomCategory, setIsCustomCategory] =
    useState(isInitialCatCustom);

  const [eventType, setEventType] = useState<EventType>(
    initialEvent?.event_type || "online"
  );
  const [location, setLocation] = useState(initialEvent?.location || "");
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState(
    initialEvent?.online_meeting_url || ""
  );

  const [startDateTime, setStartDateTime] = useState(
    toLocalInputDatetime(initialEvent?.start_at)
  );
  const [endDateTime, setEndDateTime] = useState(() => {
    if (initialEvent?.end_at) {
      return toLocalInputDatetime(initialEvent.end_at);
    }
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(12, 0, 0, 0);
    return formatForInput(end);
  });

  const [registrationType, setRegistrationType] = useState<RegistrationType>(
    initialEvent?.registration_type || "internal"
  );
  const [registrationUrl, setRegistrationUrl] = useState(
    initialEvent?.registration_url || ""
  );
  const [capacity, setCapacity] = useState<string>(
    initialEvent?.capacity !== null && initialEvent?.capacity !== undefined
      ? String(initialEvent.capacity)
      : ""
  );

  // Poster Image State
  const initialPosterUrl =
    initialEvent?.image_url ||
    getEventPosterPublicUrl(initialEvent?.image_path);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(
    initialPosterUrl || null
  );
  const [persistedImagePath, setPersistedImagePath] = useState<string | null>(
    initialEvent?.image_path || null
  );
  const [isPosterRemoved, setIsPosterRemoved] = useState(false);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  // Validation & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittingStatus, setSubmittingStatus] = useState<EventStatus | null>(
    null
  );

  const activeCategory = isCustomCategory ? customCategory : category;

  // Handle Poster File Selection
  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosterError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePosterFile(file);
    if (!validation.isValid) {
      setPosterError(validation.error || "Invalid image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPosterFile(file);
    setIsPosterRemoved(false);
    const objectUrl = URL.createObjectURL(file);
    setPosterPreviewUrl(objectUrl);
  };

  // Handle Poster Removal
  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreviewUrl(null);
    setIsPosterRemoved(true);
    setPosterError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Quick duration helper (adds hours to endDateTime based on startDateTime)
  const addHoursToEnd = (hours: number) => {
    if (!startDateTime) return;
    const start = new Date(startDateTime);
    if (isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + hours * 3600 * 1000);
    setEndDateTime(formatForInput(end));

    setErrors((prev) => {
      const next = { ...prev };
      delete next.end_at;
      return next;
    });
  };

  // Build the CreateEventInput / UpdateEventInput payload
  const buildPayload = (
    targetStatus: EventStatus,
    finalImagePath: string | null
  ): CreateEventInput => {
    const startIso = startDateTime ? new Date(startDateTime).toISOString() : "";
    const endIso = endDateTime ? new Date(endDateTime).toISOString() : "";
    const parsedCapacity =
      capacity.trim() !== "" ? parseInt(capacity, 10) : null;

    return {
      title: title.trim(),
      description: description.trim(),
      category: activeCategory.trim(),
      event_type: eventType,
      location:
        eventType === "offline" || eventType === "hybrid"
          ? location.trim() || null
          : null,
      online_meeting_url:
        eventType === "online" || eventType === "hybrid"
          ? onlineMeetingUrl.trim() || null
          : null,
      start_at: startIso,
      end_at: endIso,
      registration_type: registrationType,
      registration_url:
        registrationType === "external" ? registrationUrl.trim() || null : null,
      capacity: parsedCapacity,
      status: targetStatus,
      image_path: finalImagePath,
    };
  };

  // Client-side form validation
  const validateForm = (payload: CreateEventInput): boolean => {
    const result = isEditing
      ? validateUpdateEventInput(payload as UpdateEventInput)
      : validateCreateEventInput(payload);

    setErrors(result.fieldErrors);
    if (!result.isValid) {
      setServerError(
        result.errorMessage || "Please correct the highlighted fields."
      );
      return false;
    }
    setServerError(null);
    return true;
  };

  // Submit Handler
  const handleSubmit = async (targetStatus: EventStatus) => {
    if (isPending) return;

    setServerError(null);
    setPosterError(null);

    // Initial pre-upload validation check
    const preliminaryPayload = buildPayload(
      targetStatus,
      isPosterRemoved ? null : persistedImagePath
    );

    if (!validateForm(preliminaryPayload)) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    setSubmittingStatus(targetStatus);

    startTransition(async () => {
      try {
        let finalImagePath: string | null = isPosterRemoved
          ? null
          : persistedImagePath;

        // Step 1: Upload new poster file if selected
        if (posterFile) {
          setIsUploadingPoster(true);
          const formData = new FormData();
          formData.append("file", posterFile);
          if (initialEvent?.id) {
            formData.append("eventId", initialEvent.id);
          }

          const uploadRes = await uploadPosterAction(formData);

          if (uploadRes.error || !uploadRes.data) {
            setPosterError(
              uploadRes.error || "Failed to upload event poster."
            );
            setServerError(
              "Poster upload failed. Please verify the image file and try again."
            );
            setIsUploadingPoster(false);
            setSubmittingStatus(null);
            return;
          }

          finalImagePath = uploadRes.data.path;
          setPersistedImagePath(finalImagePath);
          setIsUploadingPoster(false);
        }

        // Step 2: Build final validated payload with final image path
        const finalPayload = buildPayload(targetStatus, finalImagePath);

        if (!validateForm(finalPayload)) {
          setSubmittingStatus(null);
          return;
        }

        // Step 3: Execute create or update operation
        if (isEditing && initialEvent) {
          const updateRes = await updateEventAction(
            initialEvent.id,
            finalPayload as UpdateEventInput
          );

          if (updateRes.error) {
            setServerError(updateRes.error.message);
            if (updateRes.error.fieldErrors) {
              setErrors(updateRes.error.fieldErrors);
            }
            setSubmittingStatus(null);
            return;
          }

          const encodedTitle = encodeURIComponent(
            updateRes.data?.title || title
          );
          router.push(
            `/admin/dashboard?updated=true&status=${targetStatus}&title=${encodedTitle}`
          );
        } else {
          const createRes = await createEventAction(finalPayload);

          if (createRes.error) {
            setServerError(createRes.error.message);
            if (createRes.error.fieldErrors) {
              setErrors(createRes.error.fieldErrors);
            }
            setSubmittingStatus(null);
            return;
          }

          const encodedTitle = encodeURIComponent(
            createRes.data?.title || title
          );
          router.push(
            `/admin/dashboard?created=true&status=${targetStatus}&title=${encodedTitle}`
          );
        }
      } catch (err) {
        setServerError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while saving the event."
        );
        setSubmittingStatus(null);
        setIsUploadingPoster(false);
      }
    });
  };

  // Readiness Checklist computation
  const isTitleValid = title.trim().length >= 3;
  const isCategoryValid = activeCategory.trim().length >= 2;
  const isScheduleValid =
    !!startDateTime &&
    !!endDateTime &&
    new Date(endDateTime) > new Date(startDateTime);
  const isVenueValid =
    eventType === "online"
      ? !onlineMeetingUrl || isValidUrl(onlineMeetingUrl)
      : eventType === "offline"
      ? location.trim().length >= 2
      : location.trim().length >= 2 ||
        !onlineMeetingUrl ||
        isValidUrl(onlineMeetingUrl);
  const isRegistrationValid =
    registrationType === "internal" ||
    (registrationType === "external" && isValidUrl(registrationUrl));

  const allChecksPass =
    isTitleValid &&
    isCategoryValid &&
    isScheduleValid &&
    isVenueValid &&
    isRegistrationValid;

  return (
    <div className="min-h-screen bg-[#FAF8FE] text-[#242136]">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-purple-100/90 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl text-[#64607D] hover:text-[#7543DF] hover:bg-[#F4F0FF] transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Logo />
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#64607D] pl-2 border-l border-purple-100">
              <Link href="/admin/dashboard" className="hover:text-[#7543DF]">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-[#7543DF]">
                {isEditing ? "Edit Event" : "Create Event"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F0FF] text-[#7543DF] border border-purple-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEditing ? "Editor Mode" : "Studio Mode"}</span>
            </span>

            <div className="text-right">
              <p className="text-xs font-bold text-[#242136] leading-none">
                {userName}
              </p>
              <p className="text-[10px] text-[#64607D] leading-none mt-0.5">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Hero Banner */}
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#302063] text-white">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>
              {isEditing
                ? "ORGANIZER EVENT EDITOR"
                : "ORGANIZER WORKSHOP STUDIO"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#242136] tracking-tight">
            {isEditing ? (
              <>
                Refine your{" "}
                <span className="bg-gradient-to-r from-[#7543DF] via-[#5C33BF] to-[#302063] bg-clip-text text-transparent">
                  workshop
                </span>{" "}
                details.
              </>
            ) : (
              <>
                Craft an{" "}
                <span className="bg-gradient-to-r from-[#7543DF] via-[#5C33BF] to-[#302063] bg-clip-text text-transparent">
                  unforgettable
                </span>{" "}
                event.
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-[#64607D] max-w-2xl leading-relaxed">
            Upload your promotional poster, configure your workshop agenda,
            schedule, venue, and registration links below. You can preserve your
            changes as a private draft or publish live to the community catalog.
          </p>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">Unable to save event</p>
              <p className="mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Form & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form Fields (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* ============================================================= */}
            {/* FEATURE 1: EVENT POSTER UPLOAD SECTION                        */}
            {/* ============================================================= */}
            <div
              id="field-image_path"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-purple-50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FF] text-[#7543DF] flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#242136]">
                      Event Poster &amp; Visuals
                    </h2>
                    <p className="text-xs text-[#64607D]">
                      Upload an eye-catching banner for your event card &amp;
                      detail view
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7543DF] bg-[#F4F0FF] px-2.5 py-0.5 rounded-full">
                  Recommended 16:9
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePosterSelect}
                className="hidden"
                id="event-poster-file"
              />

              {/* Poster Dropzone / Preview Display */}
              {posterPreviewUrl ? (
                /* Image Preview Container */
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-purple-100 bg-[#FAF8FE] shadow-inner group">
                    <Image
                      src={posterPreviewUrl}
                      alt="Event poster preview"
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-102"
                    />

                    {/* Overlay Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/20">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                        title="Replace image"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemovePoster}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-red-300 hover:text-white hover:bg-red-500/80 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    {/* Status Pill */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 text-[#302063] backdrop-blur-md shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {posterFile
                            ? `Selected: ${posterFile.name} (${(
                                posterFile.size /
                                (1024 * 1024)
                              ).toFixed(2)} MB)`
                            : "Poster active in storage"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#64607D]">
                    This poster will be prominently displayed on your event card
                    and public discovery page.
                  </p>
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer border-2 border-dashed border-purple-200 hover:border-[#7543DF] rounded-2xl p-8 sm:p-10 text-center bg-[#FAF8FE] hover:bg-[#F4F0FF]/40 transition-all flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F0FF] text-[#7543DF] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#242136]">
                      Click to upload event poster{" "}
                      <span className="font-normal text-[#64607D]">
                        or drag &amp; drop
                      </span>
                    </p>
                    <p className="text-xs text-[#64607D] mt-1">
                      JPEG, PNG, or WebP up to 5 MB • Landscape 16:9 ratio
                      recommended
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#7543DF] bg-white border border-purple-200 shadow-xs group-hover:bg-[#7543DF] group-hover:text-white transition-all">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Choose Image File</span>
                  </span>
                </div>
              )}

              {/* Poster Error */}
              {posterError && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{posterError}</span>
                </p>
              )}
            </div>

            {/* ============================================================= */}
            {/* SECTION 2: BASIC INFORMATION                                  */}
            {/* ============================================================= */}
            <div
              id="field-title"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-purple-50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FF] text-[#7543DF] flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#242136]">
                      Basic Information
                    </h2>
                    <p className="text-xs text-[#64607D]">
                      Name, category, and agenda overview
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7543DF] bg-[#F4F0FF] px-2.5 py-0.5 rounded-full">
                  Required
                </span>
              </div>

              {/* Event Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="event-title"
                    className="text-xs font-bold text-[#242136]"
                  >
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-medium ${
                      title.length > 200
                        ? "text-red-500 font-bold"
                        : "text-[#64607D]"
                    }`}
                  >
                    {title.length}/200 characters
                  </span>
                </div>

                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.title;
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g., Full-Stack Next.js 16 Masterclass & Live Q&A"
                  maxLength={200}
                  className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] border text-sm text-[#242136] placeholder-[#64607D]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7543DF] focus:border-transparent transition-all ${
                    errors.title
                      ? "border-red-400 bg-red-50/20"
                      : "border-purple-100"
                  }`}
                />
                {errors.title && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* Category Selection */}
              <div id="field-category" className="space-y-2">
                <label className="text-xs font-bold text-[#242136]">
                  Category <span className="text-red-500">*</span>
                </label>

                {/* Quick Pick Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {POPULAR_CATEGORIES.map((cat) => {
                    const isSelected = !isCustomCategory && category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategory(cat);
                          if (errors.category) {
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.category;
                              return n;
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-[#302063] text-white shadow-xs"
                            : "bg-[#FAF8FE] text-[#64607D] border border-purple-100 hover:border-purple-300 hover:text-[#242136]"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isCustomCategory
                        ? "bg-[#302063] text-white shadow-xs"
                        : "bg-[#FAF8FE] text-[#64607D] border border-dashed border-purple-200 hover:border-purple-400"
                    }`}
                  >
                    + Custom Category
                  </button>
                </div>

                {/* Custom Category Input if toggled */}
                {isCustomCategory && (
                  <div className="pt-2 animate-fade-in">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        if (errors.category) {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.category;
                            return n;
                          });
                        }
                      }}
                      placeholder="Type custom category name (e.g., Quantum Computing)"
                      maxLength={60}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8FE] border border-purple-200 text-xs text-[#242136] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7543DF]"
                    />
                  </div>
                )}

                {errors.category && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.category}</span>
                  </p>
                )}
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="event-description"
                    className="text-xs font-bold text-[#242136]"
                  >
                    Event Description
                  </label>
                  <span className="text-[10px] text-[#64607D]">
                    Markdown or plain text supported
                  </span>
                </div>

                <textarea
                  id="event-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share the workshop agenda, who should attend, prerequisites, and what skills attendees will gain..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] border border-purple-100 text-sm text-[#242136] placeholder-[#64607D]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7543DF] focus:border-transparent transition-all resize-y"
                />
              </div>
            </div>

            {/* ============================================================= */}
            {/* SECTION 3: EVENT FORMAT & VENUES                              */}
            {/* ============================================================= */}
            <div
              id="field-event_type"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-purple-50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FF] text-[#7543DF] flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#242136]">
                      Event Format &amp; Venues
                    </h2>
                    <p className="text-xs text-[#64607D]">
                      Online link, physical address, or hybrid setup
                    </p>
                  </div>
                </div>
              </div>

              {/* 3-Card Format Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "online" as const,
                    title: "Online Session",
                    description: "Virtual via Google Meet, Zoom, or Teams",
                    icon: <Laptop className="w-5 h-5 text-[#7543DF]" />,
                  },
                  {
                    id: "offline" as const,
                    title: "In-Person Event",
                    description: "Physical room, auditorium, or lab",
                    icon: <MapPin className="w-5 h-5 text-[#7543DF]" />,
                  },
                  {
                    id: "hybrid" as const,
                    title: "Hybrid Gathering",
                    description: "Both in-person venue and live link",
                    icon: <Globe className="w-5 h-5 text-[#7543DF]" />,
                  },
                ].map((item) => {
                  const isSelected = eventType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setEventType(item.id);
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.location;
                          delete n.online_meeting_url;
                          return n;
                        });
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#F4F0FF] border-[#7543DF] ring-2 ring-[#7543DF]/20 shadow-xs"
                          : "bg-[#FAF8FE] border-purple-100 hover:border-purple-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-2xs">
                            {item.icon}
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#7543DF] text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-[#242136]">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-[#64607D] mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Conditional Location Input */}
              {(eventType === "offline" || eventType === "hybrid") && (
                <div id="field-location" className="space-y-1.5 animate-fade-in">
                  <label
                    htmlFor="event-location"
                    className="text-xs font-bold text-[#242136] flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#7543DF]" />
                    <span>Physical Venue Location</span>
                    {eventType === "offline" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <input
                    id="event-location"
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.location;
                          return n;
                        });
                      }
                    }}
                    placeholder="e.g., Auditorium Hall 3, Tech Community Hub, Bangalore"
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] border text-sm text-[#242136] placeholder-[#64607D]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7543DF] transition-all ${
                      errors.location
                        ? "border-red-400 bg-red-50/20"
                        : "border-purple-100"
                    }`}
                  />
                  {errors.location && (
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.location}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Conditional Online Meeting URL */}
              {(eventType === "online" || eventType === "hybrid") && (
                <div
                  id="field-online_meeting_url"
                  className="space-y-1.5 animate-fade-in"
                >
                  <label
                    htmlFor="event-meeting-url"
                    className="text-xs font-bold text-[#242136] flex items-center gap-1.5"
                  >
                    <Laptop className="w-3.5 h-3.5 text-[#7543DF]" />
                    <span>Online Meeting URL</span>
                    <span className="text-[10px] text-[#64607D] font-normal">
                      (Google Meet, Zoom, Teams)
                    </span>
                  </label>

                  <input
                    id="event-meeting-url"
                    type="url"
                    value={onlineMeetingUrl}
                    onChange={(e) => {
                      setOnlineMeetingUrl(e.target.value);
                      if (errors.online_meeting_url) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.online_meeting_url;
                          return n;
                        });
                      }
                    }}
                    placeholder="https://meet.google.com/xyz-abcd-efg or Zoom link"
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] border text-sm text-[#242136] placeholder-[#64607D]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7543DF] transition-all ${
                      errors.online_meeting_url
                        ? "border-red-400 bg-red-50/20"
                        : "border-purple-100"
                    }`}
                  />
                  {errors.online_meeting_url && (
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.online_meeting_url}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* SECTION 4: SCHEDULE & TIMING                                  */}
            {/* ============================================================= */}
            <div
              id="field-start_at"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-purple-50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FF] text-[#7543DF] flex items-center justify-center font-bold text-xs">
                    04
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#242136]">
                      Schedule &amp; Timing
                    </h2>
                    <p className="text-xs text-[#64607D]">
                      Start date, end time, and workshop duration
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7543DF] bg-[#F4F0FF] px-2.5 py-0.5 rounded-full">
                  Required
                </span>
              </div>

              {/* Start & End Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="event-start"
                    className="text-xs font-bold text-[#242136] flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#7543DF]" />
                    <span>Starts At</span> <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="event-start"
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => {
                      setStartDateTime(e.target.value);
                      if (errors.start_at || errors.end_at) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.start_at;
                          delete n.end_at;
                          return n;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] border text-sm text-[#242136] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7543DF] transition-all ${
                      errors.start_at
                        ? "border-red-400 bg-red-50/20"
                        : "border-purple-100"
                    }`}
                  />
                  {errors.start_at && (
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.start_at}</span>
                    </p>
                  )}
                </div>

                {/* End Time */}
                <div id="field-end_at" className="space-y-1.5">
                  <label
                    htmlFor="event-end"
                    className="text-xs font-bold text-[#242136] flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#7543DF]" />
                    <span>Ends At</span> <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="event-end"
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => {
                      setEndDateTime(e.target.value);
                      if (errors.end_at) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.end_at;
                          return n;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] border text-sm text-[#242136] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7543DF] transition-all ${
                      errors.end_at
                        ? "border-red-400 bg-red-50/20"
                        : "border-purple-100"
                    }`}
                  />
                  {errors.end_at && (
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.end_at}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Duration Shortcuts */}
              <div className="flex items-center flex-wrap gap-2 pt-1">
                <span className="text-xs text-[#64607D] font-medium mr-1">
                  Quick End Time:
                </span>
                <button
                  type="button"
                  onClick={() => addHoursToEnd(1)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8FE] hover:bg-[#F4F0FF] text-[#7543DF] border border-purple-100 transition-colors"
                >
                  +1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => addHoursToEnd(2)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8FE] hover:bg-[#F4F0FF] text-[#7543DF] border border-purple-100 transition-colors"
                >
                  +2 Hours
                </button>
                <button
                  type="button"
                  onClick={() => addHoursToEnd(3)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8FE] hover:bg-[#F4F0FF] text-[#7543DF] border border-purple-100 transition-colors"
                >
                  +3 Hours
                </button>
                <button
                  type="button"
                  onClick={() => addHoursToEnd(4)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8FE] hover:bg-[#F4F0FF] text-[#7543DF] border border-purple-100 transition-colors"
                >
                  Half-Day (+4h)
                </button>
              </div>

              {/* Timezone Note */}
              <div className="p-3 rounded-2xl bg-[#FAF8FE] border border-purple-50 flex items-center gap-2 text-xs text-[#64607D]">
                <Info className="w-4 h-4 text-[#7543DF] shrink-0" />
                <span>
                  Configured in your local browser timezone. Converted
                  automatically to universal UTC ISO-8601 timestamps upon save.
                </span>
              </div>
            </div>

            {/* ============================================================= */}
            {/* FEATURE 2: DEDICATED REGISTRATION SECTION                     */}
            {/* ============================================================= */}
            <div
              id="field-registration_type"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-purple-50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FF] text-[#7543DF] flex items-center justify-center font-bold text-xs">
                    05
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#242136]">
                      Dedicated Registration Experience
                    </h2>
                    <p className="text-xs text-[#64607D]">
                      Select how participants register, RSVP, and access your
                      event
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7543DF] bg-[#F4F0FF] px-2.5 py-0.5 rounded-full">
                  Registration Mode
                </span>
              </div>

              {/* 2-Card Registration Type Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* External Registration Card */}
                <button
                  type="button"
                  onClick={() => setRegistrationType("external")}
                  className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    registrationType === "external"
                      ? "bg-[#F4F0FF] border-[#7543DF] ring-2 ring-[#7543DF]/20 shadow-xs"
                      : "bg-[#FAF8FE] border-purple-100 hover:border-purple-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs">
                        <ExternalLink className="w-4 h-4 text-[#7543DF]" />
                      </div>
                      {registrationType === "external" && (
                        <span className="w-5 h-5 rounded-full bg-[#7543DF] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#242136]">
                      External Registration Link
                    </h3>
                    <p className="text-xs text-[#64607D] mt-1 leading-relaxed">
                      Direct attendees to an external ticketing platform (Unstop,
                      Luma, Google Forms, Eventbrite).
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-purple-100/60">
                    <span className="text-[10px] font-semibold text-[#7543DF]">
                      Shows prominent &quot;Register Now&quot; button
                    </span>
                  </div>
                </button>

                {/* Internal Registration Card */}
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationType("internal");
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n.registration_url;
                      return n;
                    });
                  }}
                  className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    registrationType === "internal"
                      ? "bg-[#F4F0FF] border-[#7543DF] ring-2 ring-[#7543DF]/20 shadow-xs"
                      : "bg-[#FAF8FE] border-purple-100 hover:border-purple-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs">
                        <Ticket className="w-4 h-4 text-[#7543DF]" />
                      </div>
                      {registrationType === "internal" && (
                        <span className="w-5 h-5 rounded-full bg-[#7543DF] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#242136]">
                      Internal Community RSVP
                    </h3>
                    <p className="text-xs text-[#64607D] mt-1 leading-relaxed">
                      Learners register directly through Community Skills Hub
                      without leaving the platform.
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-purple-100/60">
                    <span className="text-[10px] font-semibold text-emerald-700">
                      Shows prominent &quot;Join Event&quot; button
                    </span>
                  </div>
                </button>
              </div>

              {/* Conditional External Registration Configuration */}
              {registrationType === "external" ? (
                <div
                  id="field-registration_url"
                  className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#FAF8FE] border border-purple-100 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="event-reg-url"
                      className="text-xs font-bold text-[#242136] flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#7543DF]" />
                      <span>Dedicated Registration URL</span>{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-[#64607D]">
                      Must start with http:// or https://
                    </span>
                  </div>

                  <input
                    id="event-reg-url"
                    type="url"
                    value={registrationUrl}
                    onChange={(e) => {
                      setRegistrationUrl(e.target.value);
                      if (errors.registration_url) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.registration_url;
                          return n;
                        });
                      }
                    }}
                    placeholder="https://unstop.com/o/... or https://lu.ma/your-workshop"
                    className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#242136] placeholder-[#64607D]/50 focus:outline-none focus:ring-2 focus:ring-[#7543DF] transition-all shadow-2xs ${
                      errors.registration_url
                        ? "border-red-400 bg-red-50/20"
                        : "border-purple-200"
                    }`}
                  />
                  {errors.registration_url && (
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.registration_url}</span>
                    </p>
                  )}

                  {/* Supported Platform Chips */}
                  <div className="pt-2">
                    <p className="text-[11px] font-medium text-[#64607D] mb-1.5">
                      Common supported registration platforms:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUPPORTED_REGISTRATION_PLATFORMS.map((platform) => (
                        <span
                          key={platform}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#302063] border border-purple-100"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100/70 flex items-start gap-2 text-xs text-[#302063]">
                    <Info className="w-4 h-4 text-[#7543DF] shrink-0 mt-0.5" />
                    <span>
                      The registration link is kept separate from the event
                      description. When participants view your event, clicking{" "}
                      <strong>&quot;Register Now&quot;</strong> safely opens this
                      URL in a new tab.
                    </span>
                  </div>
                </div>
              ) : (
                /* Internal Registration Explanation */
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Community Skills Hub RSVP Flow</span>
                  </div>
                  <p className="text-xs text-emerald-950/80 leading-relaxed">
                    Participants will register directly through Community Skills
                    Hub. Your event card and detail page will display a prominent{" "}
                    <strong>&quot;Join Event&quot;</strong> button. Attendee
                    slots will automatically respect your configured participant
                    capacity.
                  </p>
                </div>
              )}

              {/* Participant Capacity */}
              <div id="field-capacity" className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="event-capacity"
                    className="text-xs font-bold text-[#242136] flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-[#7543DF]" />
                    <span>Participant Capacity Cap</span>
                    <span className="text-[10px] text-[#64607D] font-normal">
                      (Optional)
                    </span>
                  </label>
                  <span className="text-[10px] text-[#64607D]">
                    Leave blank for unlimited attendees
                  </span>
                </div>

                <input
                  id="event-capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={capacity}
                  onChange={(e) => {
                    setCapacity(e.target.value);
                    if (errors.capacity) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.capacity;
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g., 50 (maximum seats available)"
                  className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] border text-sm text-[#242136] placeholder-[#64607D]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7543DF] transition-all ${
                    errors.capacity
                      ? "border-red-400 bg-red-50/20"
                      : "border-purple-100"
                  }`}
                />
                {errors.capacity && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.capacity}</span>
                  </p>
                )}
              </div>
            </div>

            {/* ============================================================= */}
            {/* SECTION 6: PUBLISHING & ACTION CONTROLS                       */}
            {/* ============================================================= */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#242136]">
                  Publishing Controls
                </h2>
                <p className="text-xs text-[#64607D] mt-0.5">
                  Save privately as a draft or publish immediately to the
                  community catalog.
                </p>
              </div>

              {/* Status Explanation Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FAF8FE] border border-purple-50 text-xs">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-800">
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Draft Status</span>
                  </span>
                  <p className="text-[11px] text-[#64607D]">
                    Stored privately in your Organizer Studio. You can edit,
                    refine, and publish whenever you are ready.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Published Status</span>
                  </span>
                  <p className="text-[11px] text-[#64607D]">
                    Goes live immediately in the public Explore directory with
                    your name displayed on the event card.
                  </p>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href="/admin/dashboard"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-[#64607D] hover:text-[#242136] hover:bg-[#F4F0FF] transition-colors text-center"
                >
                  Discard &amp; Cancel
                </Link>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                  {/* Save as Draft Button */}
                  <button
                    type="button"
                    disabled={isPending || isUploadingPoster}
                    onClick={() => handleSubmit("draft")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-[#302063] bg-white border border-purple-200 hover:bg-[#FAF8FE] hover:border-purple-400 transition-all shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isPending && submittingStatus === "draft" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#7543DF]" />
                        <span>
                          {isUploadingPoster
                            ? "Uploading Poster..."
                            : isEditing
                            ? "Updating Draft..."
                            : "Saving Draft..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <FileEdit className="w-4 h-4 text-[#7543DF]" />
                        <span>
                          {isEditing ? "Save Draft Changes" : "Save as Draft"}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Publish Event Button */}
                  <button
                    type="button"
                    disabled={isPending || isUploadingPoster}
                    onClick={() => handleSubmit("published")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#7543DF] to-[#5C33BF] hover:from-[#6332C9] hover:to-[#4D28A8] transition-all shadow-md shadow-[#7543DF]/25 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isPending && submittingStatus === "published" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>
                          {isUploadingPoster
                            ? "Uploading Poster..."
                            : isEditing
                            ? "Saving Changes..."
                            : "Publishing Event..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {isEditing ? "Update & Publish" : "Publish Event"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky Live Event Preview Card (4 Columns) */}
          <div className="lg:col-span-4 sticky top-24 space-y-5">
            {/* Preview Card Header */}
            <div className="flex items-center justify-between px-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#242136]">
                <Eye className="w-4 h-4 text-[#7543DF]" />
                <span>Live Event Preview</span>
              </span>
              <span className="text-[10px] text-[#64607D]">
                Updates dynamically
              </span>
            </div>

            {/* Dynamic Event Card Preview */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-md shadow-purple-950/5 overflow-hidden">
              {/* Poster Image Preview */}
              <div className="relative aspect-video w-full bg-gradient-to-tr from-[#302063] via-[#43257E] to-[#7543DF] flex items-center justify-center text-white overflow-hidden">
                {posterPreviewUrl ? (
                  <Image
                    src={posterPreviewUrl}
                    alt="Poster banner preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 mx-auto text-purple-200/60 mb-1" />
                    <span className="text-[10px] text-purple-200/80 font-medium">
                      Event Poster Preview
                    </span>
                  </div>
                )}

                {/* Floating Preview Badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Live Preview</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Category & Format */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4F0FF] text-[#7543DF] border border-purple-100">
                    {activeCategory || "Category"}
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64607D] capitalize">
                    {eventType}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-extrabold text-[#242136] leading-snug">
                    {title.trim() || (
                      <span className="text-[#64607D]/50 italic">
                        Your event title will appear here
                      </span>
                    )}
                  </h3>

                  {description.trim() && (
                    <p className="text-xs text-[#64607D] line-clamp-2 mt-1.5 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                {/* Meta Details */}
                <div className="space-y-2 py-3 border-t border-purple-50 text-xs">
                  {/* Schedule */}
                  <div className="flex items-center gap-2 text-[#242136]">
                    <Clock className="w-3.5 h-3.5 text-[#7543DF] shrink-0" />
                    <span className="text-[11px] font-medium">
                      {startDateTime
                        ? new Date(startDateTime).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "Schedule not set"}
                      {endDateTime &&
                        ` – ${new Date(endDateTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}`}
                    </span>
                  </div>

                  {/* Venue / Link */}
                  <div className="flex items-center gap-2 text-[#64607D]">
                    {eventType === "online" ? (
                      <>
                        <Laptop className="w-3.5 h-3.5 text-[#7543DF] shrink-0" />
                        <span className="text-[11px]">
                          {onlineMeetingUrl
                            ? "Online meeting link ready"
                            : "Online video session"}
                        </span>
                      </>
                    ) : eventType === "offline" ? (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-[#7543DF] shrink-0" />
                        <span className="text-[11px] truncate">
                          {location.trim() || "In-person location required"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 text-[#7543DF] shrink-0" />
                        <span className="text-[11px]">
                          Hybrid (In-person &amp; Online)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Capacity & Ticket */}
                  <div className="flex items-center gap-3 text-[11px] text-[#64607D] pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-[#7543DF]" />
                      <span className="capitalize">
                        {registrationType} RSVP
                      </span>
                    </span>

                    {capacity && parseInt(capacity, 10) > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#7543DF]" />
                        <span>{capacity} capacity</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Dedicated Action Button Preview */}
                <div className="pt-2">
                  {registrationType === "external" ? (
                    <div className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold text-white bg-gradient-to-r from-[#7543DF] to-[#5C33BF] flex items-center justify-center gap-2 shadow-xs">
                      <span>Register Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold text-[#302063] bg-[#F4F0FF] border border-purple-200 flex items-center justify-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-[#7543DF]" />
                      <span>Join Event (CSH RSVP)</span>
                    </div>
                  )}
                </div>

                {/* Organizer Attribution */}
                <div className="pt-3 border-t border-purple-50 flex items-center justify-between text-[11px] text-[#64607D]">
                  <span>Host</span>
                  <span className="font-bold text-[#302063]">{userName}</span>
                </div>
              </div>
            </div>

            {/* Readiness Checklist */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 space-y-3">
              <h4 className="text-xs font-bold text-[#242136] uppercase tracking-wider">
                Readiness Checklist
              </h4>

              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isTitleValid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span
                    className={
                      isTitleValid
                        ? "text-[#242136] font-medium"
                        : "text-[#64607D]"
                    }
                  >
                    Title (min. 3 characters)
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isCategoryValid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span
                    className={
                      isCategoryValid
                        ? "text-[#242136] font-medium"
                        : "text-[#64607D]"
                    }
                  >
                    Category assigned
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isScheduleValid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span
                    className={
                      isScheduleValid
                        ? "text-[#242136] font-medium"
                        : "text-[#64607D]"
                    }
                  >
                    Valid schedule &amp; duration
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isVenueValid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span
                    className={
                      isVenueValid
                        ? "text-[#242136] font-medium"
                        : "text-[#64607D]"
                    }
                  >
                    Location or meeting link valid
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isRegistrationValid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span
                    className={
                      isRegistrationValid
                        ? "text-[#242136] font-medium"
                        : "text-[#64607D]"
                    }
                  >
                    Registration settings valid
                  </span>
                </li>
              </ul>

              <div className="pt-2 border-t border-purple-50">
                <p className="text-[11px] text-[#64607D]">
                  {allChecksPass ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready to save draft or publish!</span>
                    </span>
                  ) : (
                    "Complete all required fields above to proceed."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
