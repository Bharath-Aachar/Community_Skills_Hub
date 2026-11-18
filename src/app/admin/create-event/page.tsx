import { redirect } from "next/navigation";

export default function CreateEventRedirect() {
  redirect("/admin/events/create");
}
